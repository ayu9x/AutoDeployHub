// ============================================
// Jobs Service
// Manages individual pipeline step execution
// and log retrieval
// ============================================

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/events.gateway';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private storageService: StorageService,
  ) {}

  /**
   * Get job details by ID
   */
  async findById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        pipeline: {
          select: { id: true, number: true, projectId: true },
        },
        _count: { select: { logs: true } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  /**
   * Get logs for a specific job with pagination
   */
  async getLogs(jobId: string, page: number = 1, limit: number = 500) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        where: { jobId },
        orderBy: { line: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.log.count({ where: { jobId } }),
    ]);

    return { data: logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Update job status (called by worker service)
   */
  async updateStatus(
    jobId: string,
    status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED',
    exitCode?: number,
    output?: string,
  ) {
    const data: any = { status };

    if (status === 'RUNNING') {
      data.startedAt = new Date();
    }

    if (['SUCCESS', 'FAILED', 'SKIPPED'].includes(status)) {
      data.finishedAt = new Date();
      if (exitCode !== undefined) data.exitCode = exitCode;
      if (output) data.output = output;

      // Calculate duration
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        select: { startedAt: true },
      });
      if (job?.startedAt) {
        data.duration = Math.floor((Date.now() - job.startedAt.getTime()) / 1000);
      }
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data,
      include: {
        pipeline: { select: { id: true, projectId: true } },
      },
    });

    // Emit WebSocket event
    this.eventsGateway.emitJobStatus(
      jobId,
      updatedJob.pipeline.id,
      status,
      { exitCode, step: updatedJob.step },
    );

    return updatedJob;
  }

  /**
   * Append a log line (called by worker service)
   */
  async appendLog(jobId: string, line: number, content: string, level: string = 'info') {
    const log = await this.prisma.log.create({
      data: { jobId, line, content, level },
    });

    // Get pipeline ID for WebSocket room
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { pipelineId: true },
    });

    if (job) {
      this.eventsGateway.emitJobLog(jobId, job.pipelineId, line, content, level);
    }

    return log;
  }

  /**
   * Batch append logs (more efficient for bulk log writes)
   */
  async appendLogsBatch(jobId: string, logs: Array<{ line: number; content: string; level?: string }>) {
    await this.prisma.log.createMany({
      data: logs.map((log) => ({
        jobId,
        line: log.line,
        content: log.content,
        level: log.level || 'info',
      })),
    });

    return { count: logs.length };
  }
}
