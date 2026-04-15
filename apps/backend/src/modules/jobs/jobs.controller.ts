import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get job details' })
  async findOne(@Param('id') id: string) {
    const job = await this.jobsService.findById(id);
    return { success: true, data: job };
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get job logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getLogs(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.jobsService.getLogs(id, page, limit);
    return { success: true, ...result };
  }
}
