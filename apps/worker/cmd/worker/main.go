// ============================================
// AutoDeployHub Worker Service
// Go-based pipeline execution engine
// Consumes jobs from Redis queue, clones repos,
// builds in Docker containers, and reports results
// ============================================

package main

import (
	"context"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/autodeployhub/worker/internal/config"
	"github.com/autodeployhub/worker/internal/executor"
	"github.com/autodeployhub/worker/internal/queue"
	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
)

func main() {
	// Load .env file if present (development only)
	_ = godotenv.Load()

	// Configure structured logging
	log.SetFormatter(&log.JSONFormatter{
		TimestampFormat: "2006-01-02T15:04:05.000Z",
	})
	log.SetLevel(log.InfoLevel)

	log.Info("🚀 AutoDeployHub Worker starting...")

	// Load configuration
	cfg := config.Load()

	// Create pipeline executor
	exec, err := executor.New(cfg)
	if err != nil {
		log.Fatalf("Failed to create executor: %v", err)
	}
	defer exec.Close()

	// Create queue consumer
	consumer, err := queue.NewConsumer(cfg, exec)
	if err != nil {
		log.Fatalf("Failed to create queue consumer: %v", err)
	}

	// Start consuming jobs
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	concurrency, _ := strconv.Atoi(os.Getenv("WORKER_CONCURRENCY"))
	if concurrency == 0 {
		concurrency = 5
	}

	go consumer.Start(ctx, concurrency)

	log.WithField("concurrency", concurrency).Info("Worker is ready and consuming jobs")

	// Wait for shutdown signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down worker...")
	cancel()
	consumer.Stop()
	log.Info("Worker stopped gracefully")
}
