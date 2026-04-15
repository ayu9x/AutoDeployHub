// ============================================
// Deployments Service
// Manages deployment lifecycle including
// rollbacks and canary deployments
// ============================================

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
import { EventsGateway } from '../../websocket/events.gateway';

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Create a new deployment from a successful pipeline
   */
  async create(
    projectId: string,
    pipelineId: string,
    userId: string,
    target: 'KUBERNETES' | 'DOCKER_REGISTRY' | 'STATIC_HOSTING',
    environment: string = 'production',
    canary: boolean = false,
    canaryWeight?: number,
  ) {
    // Verify pipeline succeeded
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline) throw new NotFoundException('Pipeline not found');
    if (pipeline.status !== 'SUCCESS') {
      throw new BadRequestException('Can only deploy from successful pipelines');
    }

    // Generate version from pipeline number and commit hash
    const version = `v${pipeline.number}.0.0-${(pipeline.commitHash || 'manual').substring(0, 7)}`;

    const deployment = await this.prisma.deployment.create({
      data: {
        version,
        status: 'PENDING',
        target,
        environment,
        canary,
        canaryWeight: canary ? (canaryWeight || 10) : null,
        projectId,
        pipelineId,
        deployedBy: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        pipeline: { select: { id: true, number: true } },
        user: { select: { id: true, name: true } },
      },
    });

    // Queue deploy job
    await this.queueService.addDeployJob({
      deploymentId: deployment.id,
      projectId,
      pipelineId,
      target,
      environment,
      version,
      metadata: { canary, canaryWeight },
    });

    this.logger.log(`Deployment ${deployment.id} created for project ${projectId}`);
    return deployment;
  }

  /**
   * Get all deployments for a project
   */
  async findByProject(projectId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [deployments, total] = await Promise.all([
      this.prisma.deployment.findMany({
        where: { projectId },
        include: {
          pipeline: { select: { id: true, number: true, branch: true } },
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.deployment.count({ where: { projectId } }),
    ]);

    return { data: deployments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get deployment by ID
   */
  async findById(deploymentId: string) {
    const deployment = await this.prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: {
        project: { select: { id: true, name: true, repoUrl: true } },
        pipeline: {
          select: { id: true, number: true, branch: true, commitHash: true },
        },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!deployment) throw new NotFoundException('Deployment not found');
    return deployment;
  }

  /**
   * Rollback to a previous deployment
   */
  async rollback(deploymentId: string, userId: string) {
    const deployment = await this.prisma.deployment.findUnique({
      where: { id: deploymentId },
    });

    if (!deployment) throw new NotFoundException('Deployment not found');
    if (deployment.status !== 'DEPLOYED') {
      throw new BadRequestException('Can only rollback deployed versions');
    }

    // Mark current deployment as rolled back
    await this.prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'ROLLED_BACK',
        rolledBackAt: new Date(),
      },
    });

    // Find and redeploy previous successful deployment
    const previousDeployment = await this.prisma.deployment.findFirst({
      where: {
        projectId: deployment.projectId,
        environment: deployment.environment,
        status: 'DEPLOYED',
        id: { not: deploymentId },
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Deployment ${deploymentId} rolled back`);

    return {
      rolledBack: deployment,
      restoredTo: previousDeployment,
      message: previousDeployment
        ? `Rolled back to version ${previousDeployment.version}`
        : 'Rolled back (no previous deployment found)',
    };
  }

  /**
   * Promote a canary deployment to full production
   */
  async promote(deploymentId: string) {
    const deployment = await this.prisma.deployment.findUnique({
      where: { id: deploymentId },
    });

    if (!deployment) throw new NotFoundException('Deployment not found');
    if (!deployment.canary) {
      throw new BadRequestException('This is not a canary deployment');
    }

    const updated = await this.prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        canary: false,
        canaryWeight: null,
        metadata: { ...(deployment.metadata as any), promoted: true, promotedAt: new Date() },
      },
    });

    this.logger.log(`Canary deployment ${deploymentId} promoted to full production`);
    return updated;
  }

  /**
   * Update deployment status (called by worker)
   */
  async updateStatus(
    deploymentId: string,
    status: 'IN_PROGRESS' | 'DEPLOYED' | 'FAILED',
    targetUrl?: string,
    errorMessage?: string,
  ) {
    const data: any = { status };
    if (status === 'IN_PROGRESS') data.startedAt = new Date();
    if (status === 'DEPLOYED') {
      data.finishedAt = new Date();
      if (targetUrl) data.targetUrl = targetUrl;
    }
    if (status === 'FAILED') {
      data.finishedAt = new Date();
      if (errorMessage) data.errorMessage = errorMessage;
    }

    return this.prisma.deployment.update({
      where: { id: deploymentId },
      data,
    });
  }
}
