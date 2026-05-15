import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AnalyzeStockDto {
  @ApiProperty()
  @IsString()
  symbol!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  displayName?: string;
}
