// src/locations/locations.controller.ts
import { Controller, Get } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Location } from './location.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocationResponseDto } from './dto/location-response.dto';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ubicaciones de fotógrafos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ubicaciones con coordenadas',
    type: [Location],
  })
  async getAllLocations(): Promise<LocationResponseDto[]> {
    return this.locationsService.getAllLocations();
  }
}
