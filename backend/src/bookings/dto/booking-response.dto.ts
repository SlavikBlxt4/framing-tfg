import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class BookingResponseDto {
  @ApiProperty({ example: 10 })
  bookingId: number;

  @ApiProperty({ example: 'Sesión de pareja' })
  serviceName: string;

  @ApiProperty({ example: 180 })
  price: number;

  @ApiProperty({ example: '2024-12-10T18:00:00.000Z' })
  date: string;

  @ApiProperty({ example: 'Laura Gómez' })
  clientName: string;

  @ApiProperty({ example: 'laura@example.com' })
  clientEmail: string;

  @ApiProperty({ example: 'CONFIRMED' })
  status: string;

  @ApiProperty({
    example: 120,
    description: 'Duración de la reserva en minutos',
  })
  @IsInt()
  bookedMinutes: number;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/booking/123/images/',
    required: false,
  })
  urlImages?: string;
}
