import { ApiProperty } from '@nestjs/swagger';

export class RatingHistoryResponseDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ example: 'Excelente sesión', required: false })
  comment?: string;

  @ApiProperty({ example: '14/5/2025' })
  fecha: string;

  @ApiProperty({ example: 'Sesión de retrato' })
  serviceName: string;

  @ApiProperty({ example: 'Juan Fotografo' })
  photographerName: string;

  @ApiProperty({ example: 22 })
  photographerId: number;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/framing/photographers/22/avatar.jpg',
  })
  photographerAvatar: string;
}
