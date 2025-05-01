import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  Max,
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

  @ApiPropertyOptional({ example: 'https://example.com/foto.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({ example: 'Retrato' })
  @IsString()
  @IsOptional()
  categoryName?: string;


  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  minimum_hours: number;

  @ApiPropertyOptional({ example: 10.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;
}
