import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getLogs(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
  ) {
    return this.auditService.getLogs(user.id, { page, limit, action, resource });
  }

  @Get('actions')
  async getActionTypes() {
    return {
      actions: [
        'PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE',
        'PIPELINE_RUN', 'PIPELINE_CANCEL', 'PIPELINE_RETRY',
        'DEPLOYMENT_CREATE', 'DEPLOYMENT_ROLLBACK', 'DEPLOYMENT_PROMOTE',
        'SECRET_CREATE', 'SECRET_DELETE',
        'TEAM_INVITE', 'TEAM_REMOVE', 'TEAM_ROLE_CHANGE',
        'TOKEN_CREATE', 'TOKEN_REVOKE',
        'LOGIN', 'LOGOUT',
      ],
    };
  }
}
