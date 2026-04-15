// ============================================
// Users Service
// ============================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        githubId: true,
        createdAt: true,
        updatedAt: true,
        projects: {
          select: {
            role: true,
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        githubId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserStats(userId: string) {
    const [projectCount, pipelineCount, deploymentCount] = await Promise.all([
      this.prisma.projectMember.count({ where: { userId } }),
      this.prisma.pipeline.count({ where: { triggeredBy: userId } }),
      this.prisma.deployment.count({ where: { deployedBy: userId } }),
    ]);

    return { projectCount, pipelineCount, deploymentCount };
  }
}
