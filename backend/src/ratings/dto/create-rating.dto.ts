import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    example: 5,
    description: 'ID del servicio que se está calificando',
  })
  @IsInt()
  serviceId: number;

  @ApiProperty({
    example: 4,
    description: 'Valor de la calificación (de 1 a 5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  ratingValue: number;

  @ApiPropertyOptional({
    example: 'Muy buen servicio y atención',
    description: 'Comentario adicional (opcional)',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
