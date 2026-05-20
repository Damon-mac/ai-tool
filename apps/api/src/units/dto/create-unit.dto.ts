import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ description: '单元名称', example: '文案推荐' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ description: 'URL 标识', example: 'copywriting' })
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiPropertyOptional({ description: '功能描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '图标标识' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: '前端路由路径', example: '/copywriting' })
  @IsString()
  @MinLength(1)
  route!: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '排序权重', default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '功能要点', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  points?: string[];

  @ApiPropertyOptional({ description: '按钮文案', example: '进入文案推荐' })
  @IsOptional()
  @IsString()
  cta?: string;

  @ApiPropertyOptional({ description: '标签文案', example: 'Copywriting Lab' })
  @IsOptional()
  @IsString()
  eyebrow?: string;
}
