import { IsISO8601, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    example: 5,
    description: 'ID del servicio que se desea reservar',
  })
  @IsInt()
  serviceId: number;

  @ApiProperty({
    example: '2025-04-13T16:00:00',
    description: 'Fecha y hora de la reserva en formato ISO 8601',
  })
  @IsISO8601()
  dateTime: string;
}
