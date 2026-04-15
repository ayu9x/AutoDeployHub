import { IsString, IsOptional, IsUrl, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Web App' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A modern web application', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://github.com/user/repo' })
  @IsUrl()
  repoUrl: string;

  @ApiProperty({ example: 'main', required: false })
  @IsOptional()
  @IsString()
  repoBranch?: string;

  @ApiProperty({ example: 'nodejs', required: false })
  @IsOptional()
  @IsString()
  framework?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  pipelineConfig?: any;
}

export class UpdateProjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  repoBranch?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  framework?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  pipelineConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoDeploy?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  buildCache?: boolean;
}
