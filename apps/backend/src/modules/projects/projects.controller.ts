// ============================================
// Projects Controller
// ============================================

import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(userId, dto);
    return { success: true, data: project };
  }

  @Get()
  @ApiOperation({ summary: 'List all projects for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.projectsService.findAllForUser(userId, page || 1, limit || 20);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') projectId: string) {
    const project = await this.projectsService.findById(projectId, userId);
    return { success: true, data: project };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.update(projectId, userId, dto);
    return { success: true, data: project };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  async delete(@CurrentUser('id') userId: string, @Param('id') projectId: string) {
    await this.projectsService.delete(projectId, userId);
  }

  @Post(':id/detect-framework')
  @ApiOperation({ summary: 'Auto-detect project framework' })
  async detectFramework(@Param('id') projectId: string, @CurrentUser('id') userId: string) {
    const project = await this.projectsService.findById(projectId, userId);
    const framework = await this.projectsService.autoDetectFramework(project.repoUrl);
    return { success: true, data: { framework } };
  }
}
