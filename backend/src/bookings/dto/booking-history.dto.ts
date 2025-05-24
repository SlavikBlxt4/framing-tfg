import { ApiProperty } from '@nestjs/swagger';

export class BookingHistoryDto {
  @ApiProperty({ example: 1 })
  bookingId: number;

  @ApiProperty({ example: 67 })
  serviceId: number;

  @ApiProperty({ example: '2024-11-01T10:00:00.000Z' })
  bookingDate: Date;

  @ApiProperty({ example: '2024-11-02T15:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: 'Sesión de boda' })
  serviceName: string;

  @ApiProperty({ example: 'CONFIRMED' })
  status: string;
}
