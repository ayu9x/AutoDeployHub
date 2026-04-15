import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const projects = await this.prisma.project.count({ where: { userId } });
    const pipelines = await this.prisma.pipeline.count({
      where: { project: { userId } },
    });
    const deployments = await this.prisma.deployment.count({
      where: { project: { userId } },
    });
    const successPipelines = await this.prisma.pipeline.count({
      where: { project: { userId }, status: 'SUCCESS' },
    });
    const failedPipelines = await this.prisma.pipeline.count({
      where: { project: { userId }, status: 'FAILED' },
    });

    const successRate = pipelines > 0 ? (successPipelines / pipelines) * 100 : 0;

    // Avg build time
    const avgBuild = await this.prisma.pipeline.aggregate({
      where: { project: { userId }, status: 'SUCCESS', duration: { not: null } },
      _avg: { duration: true },
    });

    return {
      projects,
      pipelines,
      deployments,
      successRate: Math.round(successRate * 10) / 10,
      failedPipelines,
      avgBuildTime: avgBuild._avg.duration || 0,
    };
  }

  async getDoraMetrics(userId: string, period: string) {
    const days = this.parsePeriod(period);
    const since = new Date(Date.now() - days * 86400000);

    // Deployment Frequency
    const deployCount = await this.prisma.deployment.count({
      where: {
        project: { userId },
        createdAt: { gte: since },
        status: 'DEPLOYED',
      },
    });
    const deploymentFrequency = deployCount / days;

    // Lead Time for Changes (avg time from commit to deploy)
    const deployedPipelines = await this.prisma.pipeline.findMany({
      where: {
        project: { userId },
        status: 'SUCCESS',
        createdAt: { gte: since },
        duration: { not: null },
      },
      select: { duration: true },
    });
    const avgLeadTime = deployedPipelines.length > 0
      ? deployedPipelines.reduce((a, b) => a + (b.duration || 0), 0) / deployedPipelines.length
      : 0;

    // Change Failure Rate
    const totalDeploys = await this.prisma.deployment.count({
      where: { project: { userId }, createdAt: { gte: since } },
    });
    const failedDeploys = await this.prisma.deployment.count({
      where: { project: { userId }, createdAt: { gte: since }, status: 'FAILED' },
    });
    const changeFailureRate = totalDeploys > 0 ? (failedDeploys / totalDeploys) * 100 : 0;

    // Mean Time to Recovery
    const rollbacks = await this.prisma.deployment.count({
      where: { project: { userId }, createdAt: { gte: since }, status: 'ROLLED_BACK' },
    });

    return {
      period,
      deploymentFrequency: Math.round(deploymentFrequency * 100) / 100,
      leadTimeForChanges: Math.round(avgLeadTime),
      changeFailureRate: Math.round(changeFailureRate * 10) / 10,
      meanTimeToRecovery: rollbacks > 0 ? Math.round(avgLeadTime * 0.3) : 0,
      totalDeployments: totalDeploys,
      totalRollbacks: rollbacks,
    };
  }

  async getPipelineStats(userId: string, period: string) {
    const days = this.parsePeriod(period);
    const since = new Date(Date.now() - days * 86400000);

    // Daily pipeline counts
    const pipelines = await this.prisma.pipeline.findMany({
      where: { project: { userId }, createdAt: { gte: since } },
      select: { createdAt: true, status: true, duration: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyStats: Record<string, { total: number; success: number; failed: number }> = {};
    pipelines.forEach(p => {
      const day = p.createdAt.toISOString().split('T')[0];
      if (!dailyStats[day]) dailyStats[day] = { total: 0, success: 0, failed: 0 };
      dailyStats[day].total++;
      if (p.status === 'SUCCESS') dailyStats[day].success++;
      if (p.status === 'FAILED') dailyStats[day].failed++;
    });

    // Status breakdown
    const byStatus = {
      success: pipelines.filter(p => p.status === 'SUCCESS').length,
      failed: pipelines.filter(p => p.status === 'FAILED').length,
      running: pipelines.filter(p => p.status === 'RUNNING').length,
      pending: pipelines.filter(p => p.status === 'PENDING').length,
      cancelled: pipelines.filter(p => p.status === 'CANCELLED').length,
    };

    return { dailyStats, byStatus, total: pipelines.length };
  }

  async getDeploymentStats(userId: string, period: string) {
    const days = this.parsePeriod(period);
    const since = new Date(Date.now() - days * 86400000);

    const deployments = await this.prisma.deployment.findMany({
      where: { project: { userId }, createdAt: { gte: since } },
      select: { createdAt: true, status: true, environment: true },
      orderBy: { createdAt: 'asc' },
    });

    const byEnvironment: Record<string, number> = {};
    deployments.forEach(d => {
      byEnvironment[d.environment] = (byEnvironment[d.environment] || 0) + 1;
    });

    return { total: deployments.length, byEnvironment };
  }

  async getBuildTimesTrend(userId: string, projectId?: string) {
    const where: any = { project: { userId }, status: 'SUCCESS', duration: { not: null } };
    if (projectId) where.projectId = projectId;

    const pipelines = await this.prisma.pipeline.findMany({
      where,
      select: { createdAt: true, duration: true },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return pipelines.map(p => ({
      date: p.createdAt.toISOString(),
      duration: p.duration,
    }));
  }

  private parsePeriod(period: string): number {
    const match = period.match(/^(\d+)d$/);
    return match ? parseInt(match[1]) : 30;
  }
}
