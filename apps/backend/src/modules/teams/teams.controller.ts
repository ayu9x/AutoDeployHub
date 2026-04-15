import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async getTeam(@CurrentUser() user: any) {
    return this.teamsService.getTeam(user.id);
  }

  @Post('invite')
  async inviteMember(
    @CurrentUser() user: any,
    @Body() body: { email: string; role: string },
  ) {
    return this.teamsService.inviteMember(user.id, body.email, body.role);
  }

  @Post('members/:memberId/role')
  async updateRole(
    @CurrentUser() user: any,
    @Param('memberId') memberId: string,
    @Body() body: { role: string },
  ) {
    return this.teamsService.updateMemberRole(user.id, memberId, body.role);
  }

  @Delete('members/:memberId')
  async removeMember(
    @CurrentUser() user: any,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.removeMember(user.id, memberId);
  }
}
