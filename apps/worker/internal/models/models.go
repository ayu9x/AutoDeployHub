// ============================================
// Shared pipeline data models
// Extracted to avoid circular imports between
// queue and executor packages
// ============================================

package models

// PipelineJob represents a job from the queue
type PipelineJob struct {
	ID          string            `json:"id"`
	PipelineID  string            `json:"pipelineId"`
	ProjectID   string            `json:"projectId"`
	RepoURL     string            `json:"repoUrl"`
	Branch      string            `json:"branch"`
	CommitHash  string            `json:"commitHash"`
	Config      PipelineConfig    `json:"config"`
	Secrets     map[string]string `json:"secrets"`
	TriggeredBy string            `json:"triggeredBy"`
}

// PipelineConfig matches the NestJS pipeline config structure
type PipelineConfig struct {
	Steps []PipelineStep    `json:"steps" yaml:"steps"`
	Cache *CacheConfig      `json:"cache,omitempty" yaml:"cache,omitempty"`
	Env   map[string]string `json:"env,omitempty" yaml:"env,omitempty"`
}

// PipelineStep defines a single step in the pipeline
type PipelineStep struct {
	Name     string `json:"name" yaml:"name"`
	Command  string `json:"command,omitempty" yaml:"command,omitempty"`
	Script   string `json:"script,omitempty" yaml:"script,omitempty"`
	Parallel bool   `json:"parallel,omitempty" yaml:"parallel,omitempty"`
	Timeout  int    `json:"timeout,omitempty" yaml:"timeout,omitempty"`
	Retries  int    `json:"retries,omitempty" yaml:"retries,omitempty"`
}

// CacheConfig defines build cache settings
type CacheConfig struct {
	Key   string   `json:"key" yaml:"key"`
	Paths []string `json:"paths" yaml:"paths"`
}

// PipelineExecutor is the interface that the executor must implement
// This allows the queue package to depend on an interface, not the concrete type
type PipelineExecutor interface {
	ExecutePipeline(ctx interface{}, job *PipelineJob) error
	Close()
}
