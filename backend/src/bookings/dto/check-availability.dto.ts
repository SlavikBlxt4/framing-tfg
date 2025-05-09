// Para recibir el horario del fotógrafo un dia en concreto
import { IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckAvailabilityDto {
  @ApiProperty({ example: 31, description: 'ID del fotógrafo' })
  @IsInt()
  photographerId: number;

  @ApiProperty({
    example: '2025-05-12',
    description: 'Fecha de la reserva (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string; // Solo se espera la fecha (yyyy-mm-dd)

  @ApiProperty({ example: 60, description: 'Duración del servicio en minutos' })
  @IsInt()
  duration: number; // en minutos
}
