import { BookingState } from '../enums/booking-state.enum';

export class BookingInfoDto {
  bookingId: number;
  clientId: number;
  bookingDate: Date;
  state: BookingState;
  serviceId: number;
  serviceName: string;
  price: number;
  clientName: string;
  clientEmail: string;
}
