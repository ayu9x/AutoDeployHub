import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogsService } from './logs.service';

@ApiTags('logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private logsService: LogsService) {}

  @Get(':jobId')
  @ApiOperation({ summary: 'Get logs for a job' })
  async getLogs(
    @Param('jobId') jobId: string,
    @Query('from') fromLine?: number,
  ) {
    const logs = await this.logsService.getJobLogs(jobId, fromLine);
    return { success: true, data: logs };
  }

  @Get(':jobId/archived')
  @ApiOperation({ summary: 'Get archived logs from S3' })
  async getArchivedLogs(@Param('jobId') jobId: string) {
    const logs = await this.logsService.getArchivedLogs(jobId);
    return { success: true, data: logs };
  }
}
