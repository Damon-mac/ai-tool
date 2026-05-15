import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class FavoriteCopywritingDto {
  @ApiProperty()
  @IsString()
  historyId!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  itemIndex!: number;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty()
  @IsString()
  styleTag!: string;
}
