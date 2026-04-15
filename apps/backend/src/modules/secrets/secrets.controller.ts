import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SecretsService } from './secrets.service';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreateSecretDto {
  @ApiProperty({ example: 'DATABASE_URL' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'postgresql://...' })
  @IsString()
  value: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('secrets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/secrets')
export class SecretsController {
  constructor(private secretsService: SecretsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a secret' })
  async upsert(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSecretDto,
  ) {
    const secret = await this.secretsService.upsert(projectId, dto.key, dto.value, dto.description);
    return { success: true, data: secret };
  }

  @Get()
  @ApiOperation({ summary: 'List all secrets (values masked)' })
  async findAll(@Param('projectId') projectId: string) {
    const secrets = await this.secretsService.findByProject(projectId);
    return { success: true, data: secrets };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a secret' })
  async delete(@Param('projectId') projectId: string, @Param('key') key: string) {
    await this.secretsService.delete(projectId, key);
    return { success: true, message: 'Secret deleted' };
  }
}
