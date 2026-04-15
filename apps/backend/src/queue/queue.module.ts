// ============================================
// Queue Module – BullMQ Integration
// Provides job queuing for pipeline execution
// ============================================

import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'pipeline-queue' },
      { name: 'build-queue' },
      { name: 'deploy-queue' },
      { name: 'notification-queue' },
    ),
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
