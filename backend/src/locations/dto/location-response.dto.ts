// src/locations/dto/location-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LocationResponseDto {
  @ApiProperty({ example: 1, description: 'ID de la ubicación' })
  id: number;

  @ApiProperty({ example: 42, description: 'ID del fotógrafo' })
  photographerId: number;

  @ApiProperty({
    example: { type: 'Point', coordinates: [-3.7058, 40.4203] },
    description: 'Coordenadas en formato GeoJSON [longitud, latitud]',
  })
  coordinates: object;
}
