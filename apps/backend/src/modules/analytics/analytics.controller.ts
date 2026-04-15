import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@CurrentUser() user: any) {
    return this.analyticsService.getOverview(user.id);
  }

  @Get('dora')
  async getDoraMetrics(
    @CurrentUser() user: any,
    @Query('period') period: string = '30d',
  ) {
    return this.analyticsService.getDoraMetrics(user.id, period);
  }

  @Get('pipelines/stats')
  async getPipelineStats(
    @CurrentUser() user: any,
    @Query('period') period: string = '30d',
  ) {
    return this.analyticsService.getPipelineStats(user.id, period);
  }

  @Get('deployments/stats')
  async getDeploymentStats(
    @CurrentUser() user: any,
    @Query('period') period: string = '30d',
  ) {
    return this.analyticsService.getDeploymentStats(user.id, period);
  }

  @Get('build-times')
  async getBuildTimes(
    @CurrentUser() user: any,
    @Query('projectId') projectId?: string,
  ) {
    return this.analyticsService.getBuildTimesTrend(user.id, projectId);
  }
}
