// ============================================
// Queue Service
// Manages job creation in BullMQ queues
// with retry logic and priority scheduling
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';

export interface PipelineJobData {
  pipelineId: string;
  projectId: string;
  repoUrl: string;
  branch: string;
  commitHash: string;
  config: any;
  secrets: Record<string, string>;
  triggeredBy: string;
}

export interface DeployJobData {
  deploymentId: string;
  projectId: string;
  pipelineId: string;
  target: string;
  environment: string;
  version: string;
  metadata: any;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('pipeline-queue') private pipelineQueue: Queue,
    @InjectQueue('build-queue') private buildQueue: Queue,
    @InjectQueue('deploy-queue') private deployQueue: Queue,
    @InjectQueue('notification-queue') private notificationQueue: Queue,
  ) {}

  /**
   * Add a pipeline execution job to the queue
   * Uses FIFO ordering with configurable priority
   */
  async addPipelineJob(data: PipelineJobData, priority: number = 0): Promise<string> {
    const options: JobOptions = {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
      timeout: 600000, // 10 minute timeout
    };

    const job = await this.pipelineQueue.add('execute-pipeline', data, options);
    this.logger.log(`Pipeline job queued: ${job.id} for pipeline ${data.pipelineId}`);
    return job.id as string;
  }

  /**
   * Add a deployment job to the queue
   */
  async addDeployJob(data: DeployJobData): Promise<string> {
    const options: JobOptions = {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 10000,
      },
      removeOnComplete: 50,
      removeOnFail: 50,
      timeout: 300000, // 5 minute timeout
    };

    const job = await this.deployQueue.add('execute-deploy', data, options);
    this.logger.log(`Deploy job queued: ${job.id} for deployment ${data.deploymentId}`);
    return job.id as string;
  }

  /**
   * Get queue statistics for monitoring
   */
  async getQueueStats() {
    const [pipelineStats, buildStats, deployStats] = await Promise.all([
      this.getStats(this.pipelineQueue),
      this.getStats(this.buildQueue),
      this.getStats(this.deployQueue),
    ]);

    return {
      pipeline: pipelineStats,
      build: buildStats,
      deploy: deployStats,
    };
  }

  private async getStats(queue: Queue) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Remove a specific job (for cancellation)
   */
  async cancelPipelineJob(jobId: string): Promise<boolean> {
    const job = await this.pipelineQueue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Pipeline job cancelled: ${jobId}`);
      return true;
    }
    return false;
  }
}
