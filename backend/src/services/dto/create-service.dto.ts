import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Sesión de retrato' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Sesión de fotos profesionales en estudio' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 120.5 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({ example: 'Retrato' })
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  minimum_minutes: number;
}
