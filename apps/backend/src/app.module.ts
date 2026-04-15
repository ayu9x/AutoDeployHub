// ============================================
// AutoDeployHub – Root Application Module
// Registers all feature modules, global guards,
// configuration, and infrastructure services
// ============================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';

// Infrastructure modules
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';
import { WebsocketModule } from './websocket/websocket.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';
import { SecretsModule } from './modules/secrets/secrets.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { LogsModule } from './modules/logs/logs.module';
import { HealthModule } from './modules/health/health.module';

import configuration from './config/configuration';

@Module({
  imports: [
    // Global configuration from environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate limiting: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // BullMQ queue connection via Redis
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // Infrastructure
    PrismaModule,
    QueueModule,
    StorageModule,
    WebsocketModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    PipelinesModule,
    JobsModule,
    DeploymentsModule,
    SecretsModule,
    WebhooksModule,
    LogsModule,
    HealthModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
