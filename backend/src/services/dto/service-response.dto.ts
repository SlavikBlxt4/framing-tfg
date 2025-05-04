import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sesión de retrato' })
  name: string;

  @ApiProperty({ example: 'Fotos profesionales en estudio con fondo blanco' })
  description: string;

  @ApiProperty({ example: 150.0 })
  price: number;

  @ApiPropertyOptional({ example: 'https://example.com/foto.jpg' })
  imageUrl?: string;

  @ApiProperty({ example: 'Retrato' })
  categoryName: string;

  @ApiProperty({ example: 30 })
  minimum_minutes: number;

  @ApiPropertyOptional({ example: 10.0 })
  discount?: number;
}
