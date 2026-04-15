// ============================================
// Pipelines Service
// Manages pipeline creation, execution,
// cancellation, and status tracking
// ============================================

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
import { EventsGateway } from '../../websocket/events.gateway';

@Injectable()
export class PipelinesService {
  private readonly logger = new Logger(PipelinesService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Trigger a new pipeline run for a project
   */
  async run(
    projectId: string,
    userId: string,
    trigger: 'PUSH' | 'PULL_REQUEST' | 'MANUAL' = 'MANUAL',
    branch?: string,
    commitHash?: string,
    commitMsg?: string,
  ) {
    // Get project with config
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        secrets: true,
        members: { where: { userId } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.members.length) {
      throw new BadRequestException('You do not have access to this project');
    }

    // Get next pipeline number
    const lastPipeline = await this.prisma.pipeline.findFirst({
      where: { projectId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });

    const pipelineNumber = (lastPipeline?.number || 0) + 1;

    // Parse pipeline config
    const config = (project.pipelineConfig as any) || {
      steps: [
        { name: 'install', command: 'npm ci' },
        { name: 'build', command: 'npm run build' },
        { name: 'test', command: 'npm test' },
      ],
    };

    // Create pipeline with jobs
    const pipeline = await this.prisma.pipeline.create({
      data: {
        number: pipelineNumber,
        status: 'PENDING',
        trigger,
        branch: branch || project.repoBranch,
        commitHash,
        commitMsg,
        config,
        projectId,
        triggeredBy: userId,
        jobs: {
          create: (config.steps || []).map((step: any, index: number) => ({
            name: step.name,
            step: index,
            status: 'QUEUED',
            command: step.command || step.script || '',
            maxRetries: step.retries || 3,
          })),
        },
      },
      include: {
        jobs: { orderBy: { step: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Decrypt secrets for the worker
    const secrets: Record<string, string> = {};
    for (const secret of project.secrets) {
      secrets[secret.key] = secret.value; // Worker will handle decryption
    }

    // Queue the pipeline for execution
    await this.queueService.addPipelineJob({
      pipelineId: pipeline.id,
      projectId,
      repoUrl: project.repoUrl,
      branch: pipeline.branch,
      commitHash: commitHash || 'HEAD',
      config,
      secrets,
      triggeredBy: userId,
    });

    // Emit WebSocket event
    this.eventsGateway.emitPipelineStatus(pipeline.id, projectId, 'PENDING');

    this.logger.log(`Pipeline #${pipelineNumber} triggered for project ${projectId}`);
    return pipeline;
  }

  /**
   * Get all pipelines for a project
   */
  async findByProject(projectId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [pipelines, total] = await Promise.all([
      this.prisma.pipeline.findMany({
        where: { projectId },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          jobs: {
            orderBy: { step: 'asc' },
            select: { id: true, name: true, step: true, status: true, duration: true },
          },
          _count: { select: { jobs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pipeline.count({ where: { projectId } }),
    ]);

    return { data: pipelines, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get a single pipeline with full details
   */
  async findById(pipelineId: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: {
        project: { select: { id: true, name: true, repoUrl: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
        jobs: {
          orderBy: { step: 'asc' },
          include: {
            _count: { select: { logs: true } },
          },
        },
        deployment: true,
      },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }

  /**
   * Cancel a running pipeline
   */
  async cancel(pipelineId: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    if (!['PENDING', 'RUNNING'].includes(pipeline.status)) {
      throw new BadRequestException('Pipeline cannot be cancelled in its current state');
    }

    // Update pipeline and all queued/running jobs
    await this.prisma.$transaction([
      this.prisma.pipeline.update({
        where: { id: pipelineId },
        data: { status: 'CANCELLED', finishedAt: new Date() },
      }),
      this.prisma.job.updateMany({
        where: {
          pipelineId,
          status: { in: ['QUEUED', 'RUNNING'] },
        },
        data: { status: 'CANCELLED', finishedAt: new Date() },
      }),
    ]);

    // Emit cancellation event
    this.eventsGateway.emitPipelineStatus(pipelineId, pipeline.projectId, 'CANCELLED');

    this.logger.log(`Pipeline ${pipelineId} cancelled`);
    return { success: true };
  }

  /**
   * Retry a failed pipeline by creating a new one with the same config
   */
  async retry(pipelineId: string, userId: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    if (pipeline.status !== 'FAILED') {
      throw new BadRequestException('Only failed pipelines can be retried');
    }

    return this.run(
      pipeline.projectId,
      userId,
      'MANUAL',
      pipeline.branch,
      pipeline.commitHash || undefined,
      `Retry of pipeline #${pipeline.number}`,
    );
  }

  /**
   * Update pipeline status (called by worker via internal API)
   */
  async updateStatus(
    pipelineId: string,
    status: 'RUNNING' | 'SUCCESS' | 'FAILED',
    duration?: number,
  ) {
    const data: any = { status };
    if (status === 'RUNNING') {
      data.startedAt = new Date();
    }
    if (['SUCCESS', 'FAILED'].includes(status)) {
      data.finishedAt = new Date();
      data.duration = duration;
    }

    const pipeline = await this.prisma.pipeline.update({
      where: { id: pipelineId },
      data,
    });

    this.eventsGateway.emitPipelineStatus(pipelineId, pipeline.projectId, status, { duration });
    return pipeline;
  }
}
