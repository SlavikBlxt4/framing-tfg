import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

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
    description: 'Datos inválidos o intento de calificar un servicio no contratado',
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
}
