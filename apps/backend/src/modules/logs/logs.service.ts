import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class LogsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  /**
   * Get logs from database for a job
   */
  async getJobLogs(jobId: string, fromLine?: number) {
    const where: any = { jobId };
    if (fromLine) {
      where.line = { gte: fromLine };
    }

    return this.prisma.log.findMany({
      where,
      orderBy: { line: 'asc' },
      take: 1000,
    });
  }

  /**
   * Get archived logs from S3
   */
  async getArchivedLogs(jobId: string) {
    return this.storageService.getLogs(jobId);
  }
}
