// ============================================
// Projects Service
// Handles project CRUD, repo connection, and
// framework auto-detection
// ============================================

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new project and add the creator as ADMIN
   */
  async create(userId: string, dto: CreateProjectDto) {
    const webhookSecret = uuid();

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        repoUrl: dto.repoUrl,
        repoBranch: dto.repoBranch || 'main',
        repoProvider: this.detectProvider(dto.repoUrl),
        framework: dto.framework,
        webhookSecret,
        pipelineConfig: dto.pipelineConfig || null,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });

    this.logger.log(`Project created: ${project.id} by user ${userId}`);
    return project;
  }

  /**
   * Get all projects for a user
   */
  async findAllForUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          members: { some: { userId } },
        },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          },
          pipelines: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, status: true, number: true, createdAt: true },
          },
          _count: {
            select: { pipelines: true, deployments: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.project.count({
        where: { members: { some: { userId } } },
      }),
    ]);

    return {
      data: projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single project by ID (with access check)
   */
  async findById(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        pipelines: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            _count: { select: { jobs: true } },
          },
        },
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { pipelines: true, deployments: true, secrets: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check access
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  /**
   * Update a project
   */
  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    await this.checkAdminAccess(projectId, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        description: dto.description,
        repoBranch: dto.repoBranch,
        framework: dto.framework,
        pipelineConfig: dto.pipelineConfig,
        autoDeploy: dto.autoDeploy,
        buildCache: dto.buildCache,
      },
    });
  }

  /**
   * Delete a project and all associated data
   */
  async delete(projectId: string, userId: string) {
    await this.checkAdminAccess(projectId, userId);

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    this.logger.log(`Project deleted: ${projectId} by user ${userId}`);
  }

  /**
   * Auto-detect the framework from a repository URL
   */
  async autoDetectFramework(repoUrl: string): Promise<string | null> {
    // In a real implementation, this would clone the repo and inspect files
    // For now, return a reasonable default based on URL patterns
    if (repoUrl.includes('next') || repoUrl.includes('react')) return 'nodejs';
    if (repoUrl.includes('django') || repoUrl.includes('flask')) return 'python';
    if (repoUrl.includes('spring') || repoUrl.includes('java')) return 'java';
    return 'nodejs'; // Default
  }

  /**
   * Detect the repository provider from URL
   */
  private detectProvider(repoUrl: string): string {
    if (repoUrl.includes('github.com')) return 'github';
    if (repoUrl.includes('gitlab.com')) return 'gitlab';
    if (repoUrl.includes('bitbucket.org')) return 'bitbucket';
    return 'github';
  }

  /**
   * Check if a user has admin access to a project
   */
  private async checkAdminAccess(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (!member) {
      throw new NotFoundException('Project not found');
    }

    if (member.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }
}
