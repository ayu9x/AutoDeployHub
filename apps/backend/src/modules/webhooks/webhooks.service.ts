// ============================================
// Webhooks Service
// Handles GitHub webhook events to trigger
// automatic pipeline runs
// ============================================

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private pipelinesService: PipelinesService,
  ) {}

  /**
   * Process incoming GitHub webhook event
   */
  async handleGithubWebhook(
    signature: string,
    event: string,
    payload: any,
  ) {
    this.logger.log(`Received GitHub webhook: ${event}`);

    // Determine the repository URL from the payload
    const repoUrl = payload.repository?.html_url || payload.repository?.url;
    if (!repoUrl) {
      throw new BadRequestException('Invalid webhook payload: missing repository URL');
    }

    // Find the project for this repository
    const project = await this.prisma.project.findFirst({
      where: {
        repoUrl: { contains: repoUrl.replace('https://github.com/', '') },
      },
      include: {
        members: {
          where: { role: 'ADMIN' },
          take: 1,
        },
      },
    });

    if (!project) {
      this.logger.warn(`No project found for repo: ${repoUrl}`);
      return { message: 'No project found for this repository' };
    }

    // Verify webhook signature
    if (project.webhookSecret) {
      const isValid = this.verifySignature(
        signature,
        JSON.stringify(payload),
        project.webhookSecret,
      );

      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    // Only process if auto-deploy is enabled
    if (!project.autoDeploy) {
      return { message: 'Auto-deploy is disabled for this project' };
    }

    // Handle different event types
    switch (event) {
      case 'push':
        return this.handlePushEvent(project, payload);
      case 'pull_request':
        return this.handlePullRequestEvent(project, payload);
      default:
        return { message: `Event type '${event}' not handled` };
    }
  }

  /**
   * Handle push events — trigger pipeline on push to monitored branch
   */
  private async handlePushEvent(project: any, payload: any) {
    const branch = payload.ref?.replace('refs/heads/', '');

    // Only trigger for the configured branch
    if (branch !== project.repoBranch) {
      return { message: `Push to ${branch} ignored (monitoring ${project.repoBranch})` };
    }

    const commitHash = payload.head_commit?.id || payload.after;
    const commitMsg = payload.head_commit?.message || 'Push event';
    const userId = project.members[0]?.userId;

    if (!userId) {
      return { message: 'No admin user found for project' };
    }

    const pipeline = await this.pipelinesService.run(
      project.id,
      userId,
      'PUSH',
      branch,
      commitHash,
      commitMsg,
    );

    this.logger.log(`Pipeline triggered by push: ${pipeline.id}`);
    return { message: 'Pipeline triggered', pipelineId: pipeline.id };
  }

  /**
   * Handle pull request events
   */
  private async handlePullRequestEvent(project: any, payload: any) {
    const action = payload.action;

    // Only trigger on PR open and synchronize (new commits)
    if (!['opened', 'synchronize'].includes(action)) {
      return { message: `PR action '${action}' not handled` };
    }

    const branch = payload.pull_request?.head?.ref;
    const commitHash = payload.pull_request?.head?.sha;
    const commitMsg = `PR #${payload.number}: ${payload.pull_request?.title}`;
    const userId = project.members[0]?.userId;

    if (!userId) {
      return { message: 'No admin user found for project' };
    }

    const pipeline = await this.pipelinesService.run(
      project.id,
      userId,
      'PULL_REQUEST',
      branch,
      commitHash,
      commitMsg,
    );

    this.logger.log(`Pipeline triggered by PR: ${pipeline.id}`);
    return { message: 'Pipeline triggered', pipelineId: pipeline.id };
  }

  /**
   * Verify GitHub webhook signature using HMAC SHA-256
   */
  private verifySignature(signature: string, payload: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }
}
