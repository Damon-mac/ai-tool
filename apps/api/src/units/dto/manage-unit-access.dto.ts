import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ManageUnitAccessDto {
  @ApiProperty({ description: '用户 ID' })
  @IsString()
  userId!: string;
}
