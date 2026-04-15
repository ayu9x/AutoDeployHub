import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs(userId: string, opts: { page: number; limit: number; action?: string; resource?: string }) {
    const where: any = { userId };
    if (opts.action) where.action = opts.action;
    if (opts.resource) where.resource = opts.resource;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page: opts.page,
        limit: opts.limit,
        total,
        pages: Math.ceil(total / opts.limit),
      },
    };
  }

  async log(userId: string, action: string, resource: string, resourceId: string, metadata?: any) {
    return this.prisma.auditLog.create({
      data: { userId, action, resource, resourceId, metadata },
    });
  }
}
