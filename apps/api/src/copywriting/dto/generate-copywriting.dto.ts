import { copyContentTypes, copyPlatforms } from '@ai-lab/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class GenerateCopywritingDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  topic!: string;

  @ApiProperty({ enum: copyPlatforms })
  @IsIn(copyPlatforms)
  platform!: (typeof copyPlatforms)[number];

  @ApiProperty({ enum: copyContentTypes })
  @IsIn(copyContentTypes)
  contentType!: (typeof copyContentTypes)[number];
}
