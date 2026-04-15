import {
  Controller, Get, Post, Param, Query, UseGuards, HttpCode, HttpStatus, Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { PipelinesService } from './pipelines.service';

@ApiTags('pipelines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipelines')
export class PipelinesController {
  constructor(private pipelinesService: PipelinesService) {}

  @Post('run')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger a new pipeline run' })
  async run(
    @CurrentUser('id') userId: string,
    @Body() body: { projectId: string; branch?: string; commitHash?: string },
  ) {
    const pipeline = await this.pipelinesService.run(
      body.projectId,
      userId,
      'MANUAL',
      body.branch,
      body.commitHash,
    );
    return { success: true, data: pipeline };
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List pipelines for a project' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.pipelinesService.findByProject(projectId, page, limit);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline details' })
  async findOne(@Param('id') id: string) {
    const pipeline = await this.pipelinesService.findById(id);
    return { success: true, data: pipeline };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a running pipeline' })
  async cancel(@Param('id') id: string) {
    const result = await this.pipelinesService.cancel(id);
    return { success: true, data: result };
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Retry a failed pipeline' })
  async retry(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const pipeline = await this.pipelinesService.retry(id, userId);
    return { success: true, data: pipeline };
  }
}
