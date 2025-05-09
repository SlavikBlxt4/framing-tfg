import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PhotographerAvailabilityService } from './photographer_availability.service';
import { CreatePhotographerAvailabilityDto } from './dto/create-photographer_availability.dto';
import {
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard  } from '../auth/jwt/jwt-auth.guard'; // Asegúrate de ajustar el path
import { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody  } from '@nestjs/swagger';


@ApiTags('Photographer Availability') // Nombre del grupo en Swagger
@ApiBearerAuth() // Para que Swagger sepa que requiere token
@Controller('photographer-availability')
@Controller('photographer-availability')
export class PhotographerAvailabilityController {
  constructor(
    private readonly photographerAvailabilityService: PhotographerAvailabilityService,
  ) {}


  // CREAR Y MODIFICAR EL HORARIO DE UN FOTÓGRAFO UN DIA EN CONCRETO (DE LA SEMANA)
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear o actualizar disponibilidad de un fotógrafo autenticado para un día' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Disponibilidad actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o franjas inexistentes' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: CreatePhotographerAvailabilityDto })
  async create(
    @Body() dto: CreatePhotographerAvailabilityDto,
    @Req() req: Request,
  ) {
    const photographerId = req.user?.userId;
    return this.photographerAvailabilityService.create(dto, photographerId);
  }



  // RECUPERAR TODO EL HORARIO DE UN FOTÓGRAFO DE TODOS LOS DIAS DE LA SEMANA
    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Obtener disponibilidad semanal del fotógrafo autenticado' })
    @ApiResponse({ status: 200, description: 'Disponibilidad semanal obtenida correctamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async findAll(@Req() req: Request) {
      const photographerId = req.user?.userId;
      return this.photographerAvailabilityService.findAllForPhotographer(photographerId);
    }


}



  

