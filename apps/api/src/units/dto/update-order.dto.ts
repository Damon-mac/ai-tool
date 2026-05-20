import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UnitOrderItem {
  @ApiProperty({ description: '单元 ID' })
  @IsString()
  id!: string;

  @ApiProperty({ description: '排序权重' })
  @IsInt()
  sortOrder!: number;
}

export class UpdateUnitOrderDto {
  @ApiProperty({ description: '排序列表', type: [UnitOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitOrderItem)
  items!: UnitOrderItem[];
}
