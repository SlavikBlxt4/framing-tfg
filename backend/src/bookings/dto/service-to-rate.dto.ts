import { ApiProperty } from '@nestjs/swagger';

export class ServiceToRateDto {
  @ApiProperty({ example: 1, description: 'ID del servicio ya realizado' })
  serviceId: number;

  @ApiProperty({ example: 'Sesión de retrato', description: 'Nombre del servicio' })
  serviceName: string;

  @ApiProperty({
    example: 'Sesión de retrato profesional con fondo neutro',
    description: 'Descripción del servicio realizado',
  })
  serviceDescription: string;

  @ApiProperty({ example: 150, description: 'Precio del servicio en euros' })
  price: number;

  @ApiProperty({
    example: 'https://example.com/imagen.jpg',
    description: 'Imagen asociada al servicio',
  })
  imageUrl: string;

  @ApiProperty({ example: 12, description: 'ID de la reserva vinculada al servicio' })
  bookingId: number;

  @ApiProperty({
    example: '2024-12-01T10:00:00.000Z',
    description: 'Fecha en la que se creó la reserva',
  })
  bookingDate: Date;

  @ApiProperty({
    example: '2024-12-05T16:00:00.000Z',
    description: 'Fecha de la sesión del servicio',
  })
  serviceDate: Date;
}
