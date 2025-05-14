import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Res,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { RatingUserResponseDto } from './dto/rating-user-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RatingHistoryResponseDto } from './dto/rating-history-response.dto';

@ApiTags('ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('rate')
  @ApiOperation({ summary: 'Calificar un servicio como cliente autenticado' })
  @ApiBody({ type: CreateRatingDto })
  @ApiResponse({
    status: 200,
    description: 'Calificación registrada con éxito',
    type: RatingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos o intento de calificar un servicio no contratado',
  })
  async rateService(
    @Body() dto: CreateRatingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const clientId = req.user['userId'];

    const result: RatingResponseDto = await this.ratingsService.createRating(
      dto,
      clientId,
    );

    return res.status(HttpStatus.OK).json(result);
  }

  @Get(':serviceId')
  @ApiOperation({ summary: 'Obtener calificaciones de un servicio' })
  @ApiParam({ name: 'serviceId', type: Number, example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Lista de calificaciones del servicio',
    type: [RatingUserResponseDto],
  })
  async getRatings(@Param('serviceId', ParseIntPipe) serviceId: number) {
    return this.ratingsService.getFormattedRatings(serviceId);
  }


  @Get('history')
  @ApiOperation({ summary: 'Obtener histórico de reseñas del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Listado de reseñas hechas por el usuario',
    type: [RatingHistoryResponseDto],
  })
  async getUserRatings(@Req() req: Request, @Res() res: Response) {
    const clientId = req.user['userId'];
    const history = await this.ratingsService.getUserRatings(clientId);
    return res.status(HttpStatus.OK).json(history);
  }

}
