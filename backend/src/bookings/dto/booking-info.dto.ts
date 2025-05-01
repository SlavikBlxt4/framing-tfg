import { ApiProperty } from '@nestjs/swagger';
import { BookingState } from '../enums/booking-state.enum';

export class BookingInfoDto {
  @ApiProperty({ example: 1 })
  bookingId: number;

  @ApiProperty({ example: 12 })
  clientId: number;

  @ApiProperty({ example: '2024-11-01T10:00:00.000Z' })
  bookingDate: Date;

  @ApiProperty({ enum: BookingState, example: BookingState.PENDING })
  state: BookingState;

  @ApiProperty({ example: 3 })
  serviceId: number;

  @ApiProperty({ example: 'Sesión de comunión' })
  serviceName: string;

  @ApiProperty({ example: 200 })
  price: number;

  @ApiProperty({ example: 'Juan Pérez' })
  clientName: string;

  @ApiProperty({ example: 'juan@example.com' })
  clientEmail: string;
}
