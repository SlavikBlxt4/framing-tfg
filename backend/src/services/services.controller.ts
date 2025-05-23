import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { TopRatedServiceDto } from './dto/top-rated-service.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('services') // Sección "services" en Swagger
@Controller('photographer/services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo servicio fotográfico' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({
    status: 200,
    description: 'Servicio creado con éxito',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Estilo (categoría) no encontrado' })
  async createService(
    @Body() dto: CreateServiceDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const photographerId = req.user['userId'];

    if (!dto.categoryId && dto.categoryName) {
      const category = await this.categoryRepo.findOne({
        where: { name: dto.categoryName },
      });

      if (!category) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Estilo no encontrado',
        });
      }

      dto.categoryId = category.id;
    }

    const service = await this.servicesService.createService(
      dto,
      photographerId,
    );

    const responseDto: ServiceResponseDto = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      imageUrl: service.imageUrl,
      categoryName: service.category.name,
      minimum_minutes: service.minimum_minutes,
      discount: service.discount,
    };

    return res.status(HttpStatus.OK).json(responseDto);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Obtener los 10 servicios mejor valorados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de los servicios con mayor puntuación promedio',
    type: [TopRatedServiceDto],
  })
  async getTopRated(): Promise<TopRatedServiceDto[]> {
    return this.servicesService.getTop10HighestRatedServices();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:serviceId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un servicio del fotógrafo autenticado' })
  @ApiParam({ name: 'serviceId', type: Number })
  @ApiResponse({ status: 200, description: 'Servicio eliminado correctamente' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para eliminar este servicio',
  })
  async deleteService(
    @Param('serviceId') serviceId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const photographerId = req.user['userId'];

    const deleted = await this.servicesService.deleteService(
      serviceId,
      photographerId,
    );
    if (deleted) {
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Service deleted successfully' });
    } else {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: 'Unauthorized to delete this service' });
    }
  }

  @Get(':categoryName')
  @ApiOperation({ summary: 'Obtener servicios por nombre de categoría' })
  @ApiParam({ name: 'categoryName', type: String })
  @ApiResponse({
    status: 200,
    description: 'Servicios encontrados',
    type: [ServiceResponseDto],
  })
  async findByCategory(
    @Param('categoryName') categoryName: string,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.getServicesByCategoryName(categoryName);
  }

  @UseGuards(JwtAuthGuard)
  @Post('edit/:serviceId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Editar un servicio existente del fotógrafo autenticado',
  })
  @ApiParam({ name: 'serviceId', type: Number })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({
    status: 200,
    description: 'Servicio editado con éxito',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para editar este servicio',
  })
  @ApiResponse({
    status: 404,
    description: 'Servicio no encontrado',
  })
  async editService(
    @Param('serviceId') serviceId: number,
    @Body() dto: CreateServiceDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const photographerId = req.user['userId'];

    if (!dto.categoryId && dto.categoryName) {
      const category = await this.categoryRepo.findOne({
        where: { name: dto.categoryName },
      });

      if (!category) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Estilo no encontrado',
        });
      }

      dto.categoryId = category.id;
    }

    const updatedService = await this.servicesService.editService(
      serviceId,
      photographerId,
      dto,
    );

    if (!updatedService) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'Unauthorized to edit this service or service not found',
      });
    }

    const responseDto: ServiceResponseDto = {
      id: updatedService.id,
      name: updatedService.name,
      description: updatedService.description,
      price: updatedService.price,
      imageUrl: updatedService.imageUrl,
      categoryName: updatedService.category.name,
      minimum_minutes: updatedService.minimum_minutes,
      discount: updatedService.discount,
    };

    return res.status(HttpStatus.OK).json(responseDto);
  }
}
