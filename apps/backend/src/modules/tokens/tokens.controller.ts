import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('API Tokens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  async listTokens(@CurrentUser() user: any) {
    return this.tokensService.listTokens(user.id);
  }

  @Post()
  async createToken(
    @CurrentUser() user: any,
    @Body() body: { name: string; scopes: string[]; expiresIn?: string },
  ) {
    return this.tokensService.createToken(user.id, body.name, body.scopes, body.expiresIn);
  }

  @Delete(':id')
  async revokeToken(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tokensService.revokeToken(user.id, id);
  }
}
