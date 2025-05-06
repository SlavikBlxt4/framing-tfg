// dto/rating-user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RatingUserResponseDto {
  @ApiProperty({ example: 'Usuario' })
  nombre: string;

  @ApiProperty({ example: '05/02/2025' })
  fecha: string;

  @ApiProperty({ example: 4 })
  puntuacion: number;

  @ApiProperty({
    example: 'Muy buen servicio y atención',
  })
  comentario: string;

  @ApiProperty({
    example: 'https://cdn.cosmos.so/imagen.jpg',
  })
  avatarUrl: string;
}
