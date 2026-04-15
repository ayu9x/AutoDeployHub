import {
  Controller, Get, Post, Param, Query, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { DeploymentsService } from './deployments.service';

@ApiTags('deployments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deployments')
export class DeploymentsController {
  constructor(private deploymentsService: DeploymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new deployment' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: {
      projectId: string;
      pipelineId: string;
      target: 'KUBERNETES' | 'DOCKER_REGISTRY' | 'STATIC_HOSTING';
      environment?: string;
      canary?: boolean;
      canaryWeight?: number;
    },
  ) {
    const deployment = await this.deploymentsService.create(
      body.projectId, body.pipelineId, userId,
      body.target, body.environment, body.canary, body.canaryWeight,
    );
    return { success: true, data: deployment };
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List deployments for a project' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.deploymentsService.findByProject(projectId, page, limit);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deployment details' })
  async findOne(@Param('id') id: string) {
    const deployment = await this.deploymentsService.findById(id);
    return { success: true, data: deployment };
  }

  @Post(':id/rollback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback a deployment' })
  async rollback(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.deploymentsService.rollback(id, userId);
    return { success: true, data: result };
  }

  @Post(':id/promote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promote canary deployment to production' })
  async promote(@Param('id') id: string) {
    const deployment = await this.deploymentsService.promote(id);
    return { success: true, data: deployment };
  }
}
