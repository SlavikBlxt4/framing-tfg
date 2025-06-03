import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  bookingId?: number;

  @ApiProperty({ required: false })
  bookingDate?: Date;

  @ApiProperty({ required: false })
  serviceName?: string;

  @ApiProperty({ required: false })
  bookingDuration?: number;

  @ApiProperty({ required: false })
  bookingPrice?: number;
}