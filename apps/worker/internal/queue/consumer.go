// ============================================
// Queue Consumer
// Connects to Redis and consumes pipeline
// jobs from BullMQ-compatible queues
// ============================================

package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/autodeployhub/worker/internal/config"
	"github.com/autodeployhub/worker/internal/models"
	"github.com/redis/go-redis/v9"
	log "github.com/sirupsen/logrus"
)

// PipelineExecutor interface for decoupled execution
type PipelineExecutor interface {
	ExecutePipeline(ctx context.Context, job *models.PipelineJob) error
}

// Consumer processes jobs from Redis queues
type Consumer struct {
	client   *redis.Client
	executor PipelineExecutor
	cfg      *config.Config
	wg       sync.WaitGroup
	stopCh   chan struct{}
}

// NewConsumer creates a new queue consumer
func NewConsumer(cfg *config.Config, exec PipelineExecutor) (*Consumer, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		DB:       0,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Info("Connected to Redis successfully")

	return &Consumer{
		client:   client,
		executor: exec,
		cfg:      cfg,
		stopCh:   make(chan struct{}),
	}, nil
}

// Start begins consuming jobs with the given concurrency
func (c *Consumer) Start(ctx context.Context, concurrency int) {
	queueKey := "bull:pipeline-queue:wait"

	for i := 0; i < concurrency; i++ {
		c.wg.Add(1)
		go func(workerID int) {
			defer c.wg.Done()
			logger := log.WithField("worker", workerID)
			logger.Info("Worker goroutine started")

			for {
				select {
				case <-ctx.Done():
					logger.Info("Worker goroutine stopping")
					return
				case <-c.stopCh:
					logger.Info("Worker goroutine stopping")
					return
				default:
					// Block waiting for a job (with timeout to check for shutdown)
					result, err := c.client.BLPop(ctx, 5*time.Second, queueKey).Result()
					if err != nil {
						if err == redis.Nil {
							continue // Timeout, no job available
						}
						if ctx.Err() != nil {
							return // Context cancelled
						}
						logger.WithError(err).Error("Error polling queue")
						time.Sleep(time.Second)
						continue
					}

					if len(result) < 2 {
						continue
					}

					// Parse the job data
					var jobData map[string]interface{}
					if err := json.Unmarshal([]byte(result[1]), &jobData); err != nil {
						logger.WithError(err).Error("Failed to parse job data")
						continue
					}

					// Extract the actual job payload
					dataStr, _ := json.Marshal(jobData["data"])
					var job models.PipelineJob
					if err := json.Unmarshal(dataStr, &job); err != nil {
						logger.WithError(err).Error("Failed to parse pipeline job")
						continue
					}

					job.ID = fmt.Sprintf("%v", jobData["id"])

					logger.WithFields(log.Fields{
						"jobId":      job.ID,
						"pipelineId": job.PipelineID,
						"projectId":  job.ProjectID,
					}).Info("Processing pipeline job")

					// Execute the pipeline
					if err := c.executor.ExecutePipeline(ctx, &job); err != nil {
						logger.WithError(err).Error("Pipeline execution failed")
					} else {
						logger.Info("Pipeline execution completed successfully")
					}
				}
			}
		}(i)
	}
}

// Stop gracefully stops the consumer
func (c *Consumer) Stop() {
	close(c.stopCh)
	c.wg.Wait()
	c.client.Close()
	log.Info("Queue consumer stopped")
}
