// src/bookings/dto/booking-resumen.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class BookingResumenDto {
  @ApiProperty({ example: 1 })
  bookingId: number;

  @ApiProperty({ example: 'Luz y Rostros' })
  photographerName: string;

  @ApiProperty({ example: '2025-04-12T14:00:00.000Z' })
  date: string;

  @ApiProperty({ example: 120 })
  imageCount: number;
}
