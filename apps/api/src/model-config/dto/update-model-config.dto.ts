import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateModelConfigDto {
  @ApiProperty()
  @IsUrl({ require_tld: false })
  baseUrl!: string;

  @ApiProperty({ required: false, description: '不填写则保留当前已保存的 API Key' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  apiKey?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  model!: string;

  @ApiProperty({ enum: ['openai', 'anthropic'] })
  @IsString()
  @IsIn(['openai', 'anthropic'])
  provider!: 'openai' | 'anthropic';
}
