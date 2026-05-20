import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUnitDto {
  @ApiPropertyOptional({ description: '单元名称' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ description: 'URL 标识' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ description: '功能描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '图标标识' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '前端路由路径' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  route?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '功能要点', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  points?: string[];

  @ApiPropertyOptional({ description: '按钮文案' })
  @IsOptional()
  @IsString()
  cta?: string;

  @ApiPropertyOptional({ description: '标签文案' })
  @IsOptional()
  @IsString()
  eyebrow?: string;
}
