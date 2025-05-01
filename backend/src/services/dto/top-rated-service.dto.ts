import { ApiProperty } from '@nestjs/swagger';

export class TopRatedServiceDto {
  @ApiProperty({ example: 1 })
  serviceId: number;

  @ApiProperty({ example: 'Sesión de retrato' })
  serviceName: string;

  @ApiProperty({ example: 'https://example.com/foto.jpg' })
  imageUrl: string;

  @ApiProperty({ example: 4.8 })
  averageRating: number;
}
  