// src/locations/locations.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Location } from './location.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LocationResponseDto } from './dto/location-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CreateLocationDto } from './dto/create-locations.dto';

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

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear nuevas ubicaciones para el fotógrafo autenticado',
  })
  async createLocations(@Req() req, @Body() body: CreateLocationDto[]) {
    const userId = req.user.userId;
    console.log('userId', userId);
    return this.locationsService.addLocations(userId, body);
  }
}
