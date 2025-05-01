import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RatingResponseDto {
  @ApiProperty({ example: 1, description: 'ID único de la calificación' })
  id: number;

  @ApiProperty({ example: 5, description: 'ID del servicio calificado' })
  serviceId: number;

  @ApiProperty({ example: 12, description: 'ID del cliente que realizó la calificación' })
  clientId: number;

  @ApiProperty({ example: 4, description: 'Valor de la calificación (1 a 5)' })
  rating: number;

  @ApiPropertyOptional({
    example: 'Muy buen servicio y atención',
    description: 'Comentario opcional del cliente',
  })
  comment?: string;
}
