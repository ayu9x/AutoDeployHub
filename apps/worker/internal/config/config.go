// ============================================
// Worker Configuration
// ============================================

package config

import "os"

type Config struct {
	// Redis connection
	RedisHost     string
	RedisPort     string
	RedisPassword string

	// API connection (for status updates)
	APIBaseURL string
	APIToken   string

	// Docker settings
	DockerHost string

	// AWS S3
	AWSRegion          string
	AWSAccessKey       string
	AWSSecretKey       string
	S3ArtifactsBucket  string
	S3LogsBucket       string

	// Worker settings
	Concurrency    int
	WorkDir        string
	MaxJobTimeout  int // seconds
}

func Load() *Config {
	return &Config{
		RedisHost:          getEnv("REDIS_HOST", "localhost"),
		RedisPort:          getEnv("REDIS_PORT", "6379"),
		RedisPassword:      getEnv("REDIS_PASSWORD", ""),
		APIBaseURL:         getEnv("API_URL", "http://localhost:4000"),
		APIToken:           getEnv("WORKER_API_TOKEN", ""),
		DockerHost:         getEnv("DOCKER_HOST", "unix:///var/run/docker.sock"),
		AWSRegion:          getEnv("AWS_REGION", "us-east-1"),
		AWSAccessKey:       getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretKey:       getEnv("AWS_SECRET_ACCESS_KEY", ""),
		S3ArtifactsBucket:  getEnv("AWS_S3_ARTIFACTS_BUCKET", "autodeployhub-artifacts"),
		S3LogsBucket:       getEnv("AWS_S3_LOGS_BUCKET", "autodeployhub-logs"),
		Concurrency:        5,
		WorkDir:            getEnv("WORKER_DIR", "/tmp/autodeployhub-worker"),
		MaxJobTimeout:      600,
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
