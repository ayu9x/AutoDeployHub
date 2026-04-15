// ============================================
// Pipeline Executor
// Orchestrates pipeline step execution using
// Docker containers and reports progress
// ============================================

package executor

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/autodeployhub/worker/internal/config"
	"github.com/autodeployhub/worker/internal/queue"
	"github.com/go-redis/redis/v9"
	log "github.com/sirupsen/logrus"
)

// Executor handles pipeline execution
type Executor struct {
	cfg        *config.Config
	httpClient *http.Client
	redis      *redis.Client
}

// New creates a new executor
func New(cfg *config.Config) (*Executor, error) {
	redisClient := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
	})

	return &Executor{
		cfg:        cfg,
		httpClient: &http.Client{Timeout: 30 * time.Second},
		redis:      redisClient,
	}, nil
}

// Close cleans up resources
func (e *Executor) Close() {
	e.redis.Close()
}

// ExecutePipeline runs the full pipeline for a job
func (e *Executor) ExecutePipeline(ctx context.Context, job *queue.PipelineJob) error {
	logger := log.WithFields(log.Fields{
		"pipelineId": job.PipelineID,
		"projectId":  job.ProjectID,
	})

	// Update pipeline status to RUNNING
	e.updatePipelineStatus(job.PipelineID, "RUNNING", 0)
	startTime := time.Now()

	// Create workspace directory
	workDir := filepath.Join(e.cfg.WorkDir, job.PipelineID)
	if err := os.MkdirAll(workDir, 0755); err != nil {
		e.updatePipelineStatus(job.PipelineID, "FAILED", 0)
		return fmt.Errorf("failed to create work directory: %w", err)
	}
	defer os.RemoveAll(workDir) // Cleanup workspace after execution

	// Step 1: Clone repository
	logger.Info("Cloning repository...")
	e.publishLog(job.PipelineID, "system", 0, "📦 Cloning repository...", "info")

	if err := e.cloneRepo(ctx, job.RepoURL, job.Branch, job.CommitHash, workDir); err != nil {
		logger.WithError(err).Error("Failed to clone repository")
		e.publishLog(job.PipelineID, "system", 1, fmt.Sprintf("❌ Clone failed: %s", err.Error()), "error")
		e.updatePipelineStatus(job.PipelineID, "FAILED", int(time.Since(startTime).Seconds()))
		return err
	}
	e.publishLog(job.PipelineID, "system", 2, "✅ Repository cloned successfully", "info")

	// Step 2: Execute each pipeline step
	totalSteps := len(job.Config.Steps)
	for i, step := range job.Config.Steps {
		logger.WithField("step", step.Name).Infof("Executing step %d/%d", i+1, totalSteps)

		progress := int(float64(i) / float64(totalSteps) * 100)
		e.publishProgress(job.PipelineID, job.ProjectID, progress, step.Name)

		// Update job status to RUNNING
		e.updateJobStatus(job.PipelineID, step.Name, i, "RUNNING")
		e.publishLog(job.PipelineID, step.Name, 0, fmt.Sprintf("🔄 Running: %s", step.Name), "info")

		// Get the command to execute
		command := step.Command
		if command == "" {
			command = step.Script
		}
		if command == "" {
			e.updateJobStatus(job.PipelineID, step.Name, i, "SKIPPED")
			continue
		}

		// Execute the command
		exitCode, output, err := e.executeCommand(ctx, workDir, command, job.Secrets)

		if err != nil || exitCode != 0 {
			errorMsg := ""
			if err != nil {
				errorMsg = err.Error()
			} else {
				errorMsg = fmt.Sprintf("Command exited with code %d", exitCode)
			}

			e.publishLog(job.PipelineID, step.Name, 0, fmt.Sprintf("❌ Step failed: %s", errorMsg), "error")
			if output != "" {
				// Publish last 50 lines of output
				lines := strings.Split(output, "\n")
				start := 0
				if len(lines) > 50 {
					start = len(lines) - 50
				}
				for j, line := range lines[start:] {
					e.publishLog(job.PipelineID, step.Name, j+1, line, "error")
				}
			}

			e.updateJobStatusWithExit(job.PipelineID, step.Name, i, "FAILED", exitCode)

			// Skip remaining steps
			for j := i + 1; j < totalSteps; j++ {
				e.updateJobStatus(job.PipelineID, job.Config.Steps[j].Name, j, "SKIPPED")
			}

			duration := int(time.Since(startTime).Seconds())
			e.updatePipelineStatus(job.PipelineID, "FAILED", duration)
			return fmt.Errorf("step '%s' failed with exit code %d", step.Name, exitCode)
		}

		// Publish output logs
		if output != "" {
			lines := strings.Split(output, "\n")
			for j, line := range lines {
				if line != "" {
					e.publishLog(job.PipelineID, step.Name, j+1, line, "info")
				}
			}
		}

		e.publishLog(job.PipelineID, step.Name, 9999, fmt.Sprintf("✅ Step completed: %s", step.Name), "info")
		e.updateJobStatusWithExit(job.PipelineID, step.Name, i, "SUCCESS", 0)
	}

	// Pipeline completed successfully
	duration := int(time.Since(startTime).Seconds())
	e.publishProgress(job.PipelineID, job.ProjectID, 100, "completed")
	e.updatePipelineStatus(job.PipelineID, "SUCCESS", duration)
	e.publishLog(job.PipelineID, "system", 9999, fmt.Sprintf("🎉 Pipeline completed in %ds", duration), "info")

	logger.WithField("duration", duration).Info("Pipeline completed successfully")
	return nil
}

// cloneRepo clones a git repository to the workspace
func (e *Executor) cloneRepo(ctx context.Context, repoURL, branch, commitHash, workDir string) error {
	// Use git CLI for cloning (more reliable than go-git for large repos)
	args := []string{"clone", "--branch", branch, "--depth", "1", repoURL, workDir}

	cmd := exec.CommandContext(ctx, "git", args...)
	cmd.Env = append(os.Environ(), "GIT_TERMINAL_PROMPT=0")

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("git clone failed: %s - %w", string(output), err)
	}

	// Checkout specific commit if provided
	if commitHash != "" && commitHash != "HEAD" {
		cmd = exec.CommandContext(ctx, "git", "checkout", commitHash)
		cmd.Dir = workDir
		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("git checkout failed: %s - %w", string(output), err)
		}
	}

	return nil
}

// executeCommand runs a shell command in the workspace with environment secrets
func (e *Executor) executeCommand(ctx context.Context, workDir, command string, secrets map[string]string) (int, string, error) {
	// Create timeout context
	timeout := time.Duration(e.cfg.MaxJobTimeout) * time.Second
	cmdCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(cmdCtx, "sh", "-c", command)
	cmd.Dir = workDir

	// Set environment variables from secrets
	cmd.Env = os.Environ()
	for key, value := range secrets {
		cmd.Env = append(cmd.Env, fmt.Sprintf("%s=%s", key, value))
	}

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	output := stdout.String()
	if stderr.Len() > 0 {
		output += "\n" + stderr.String()
	}

	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			exitCode = 1
		}
	}

	return exitCode, output, nil
}

// publishLog publishes a log line to Redis for real-time streaming
func (e *Executor) publishLog(pipelineID, stepName string, line int, content, level string) {
	data, _ := json.Marshal(map[string]interface{}{
		"pipelineId": pipelineID,
		"stepName":   stepName,
		"line":       line,
		"content":    content,
		"level":      level,
		"timestamp":  time.Now().Format(time.RFC3339),
	})

	e.redis.Publish(context.Background(), "job-logs", string(data))
}

// publishProgress publishes build progress for the dashboard
func (e *Executor) publishProgress(pipelineID, projectID string, progress int, currentStep string) {
	data, _ := json.Marshal(map[string]interface{}{
		"pipelineId":  pipelineID,
		"projectId":   projectID,
		"progress":    progress,
		"currentStep": currentStep,
		"timestamp":   time.Now().Format(time.RFC3339),
	})

	e.redis.Publish(context.Background(), "build-progress", string(data))
}

// updatePipelineStatus calls the API to update pipeline status
func (e *Executor) updatePipelineStatus(pipelineID, status string, duration int) {
	url := fmt.Sprintf("%s/api/internal/pipelines/%s/status", e.cfg.APIBaseURL, pipelineID)
	body, _ := json.Marshal(map[string]interface{}{
		"status":   status,
		"duration": duration,
	})

	req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", e.cfg.APIToken))

	resp, err := e.httpClient.Do(req)
	if err != nil {
		log.WithError(err).Error("Failed to update pipeline status")
		return
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)
}

// updateJobStatus calls the API to update job status
func (e *Executor) updateJobStatus(pipelineID, stepName string, step int, status string) {
	e.updateJobStatusWithExit(pipelineID, stepName, step, status, 0)
}

// updateJobStatusWithExit updates job status with exit code
func (e *Executor) updateJobStatusWithExit(pipelineID, stepName string, step int, status string, exitCode int) {
	url := fmt.Sprintf("%s/api/internal/jobs/status", e.cfg.APIBaseURL)
	body, _ := json.Marshal(map[string]interface{}{
		"pipelineId": pipelineID,
		"stepName":   stepName,
		"step":       step,
		"status":     status,
		"exitCode":   exitCode,
	})

	req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", e.cfg.APIToken))

	resp, err := e.httpClient.Do(req)
	if err != nil {
		log.WithError(err).Error("Failed to update job status")
		return
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)
}
