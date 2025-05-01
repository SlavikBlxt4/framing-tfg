import { ApiProperty } from '@nestjs/swagger';

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
}
