import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SearchStockDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  keyword!: string;
}
