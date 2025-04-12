import { IsISO8601, IsInt } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  serviceId: number;

  @IsISO8601()
  dateTime: string; // formato ISO: "2025-04-13T16:00:00"
}
