import { ApiProperty } from '@nestjs/swagger';

export class TopPhotographerDto {
  @ApiProperty()
  photographer_id: number;

  @ApiProperty()
  photographer_name: string;

  @ApiProperty()
  booking_count: number;
}
