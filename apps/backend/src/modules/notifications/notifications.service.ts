import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type NotificationType =
  | 'PIPELINE_SUCCESS' | 'PIPELINE_FAILED'
  | 'DEPLOYMENT_SUCCESS' | 'DEPLOYMENT_FAILED' | 'DEPLOYMENT_ROLLBACK'
  | 'TEAM_INVITE' | 'SECURITY_ALERT'
  | 'BUILD_TIMEOUT';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string, opts: { unreadOnly: boolean; page: number; limit: number }) {
    const where: any = { userId };
    if (opts.unreadOnly) where.readAt = null;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      pagination: { page: opts.page, limit: opts.limit, total, pages: Math.ceil(total / opts.limit) },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { unread: count };
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async create(userId: string, type: NotificationType, title: string, message: string, link?: string) {
    return this.prisma.notification.create({
      data: { userId, type, title, message, link },
    });
  }

  async notifyPipelineResult(userId: string, projectName: string, pipelineNumber: number, status: string, pipelineId: string) {
    const type = status === 'SUCCESS' ? 'PIPELINE_SUCCESS' : 'PIPELINE_FAILED';
    const title = status === 'SUCCESS'
      ? `Pipeline #${pipelineNumber} succeeded`
      : `Pipeline #${pipelineNumber} failed`;
    const message = `${projectName} — Pipeline #${pipelineNumber} ${status.toLowerCase()}`;
    await this.create(userId, type as NotificationType, title, message, `/dashboard/pipelines/${pipelineId}`);
  }

  async notifyDeployment(userId: string, projectName: string, version: string, status: string) {
    const type = status === 'DEPLOYED' ? 'DEPLOYMENT_SUCCESS' : 'DEPLOYMENT_FAILED';
    const title = `${projectName} ${version} deployed`;
    const message = `Deployment ${status.toLowerCase()} for ${projectName} ${version}`;
    await this.create(userId, type as NotificationType, title, message, `/dashboard/deployments`);
  }
}
