// ============================================
// Users Controller
// ============================================

import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    return { success: true, data: user };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: { name?: string; avatarUrl?: string },
  ) {
    const user = await this.usersService.updateProfile(userId, data);
    return { success: true, data: user };
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current user statistics' })
  async getStats(@CurrentUser('id') userId: string) {
    const stats = await this.usersService.getUserStats(userId);
    return { success: true, data: stats };
  }
}
