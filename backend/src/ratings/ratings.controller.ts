import {
  Controller,
  Req,
  UseGuards,
  Res,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingUserResponseDto } from './dto/rating-user-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
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

  @Get('history')
  @ApiOperation({
    summary: 'Obtener histórico de reseñas del usuario autenticado',
  })
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

  @Get('photographer/:id')
  @ApiOperation({
    summary: 'Obtener todas las calificaciones de un fotógrafo por ID',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    type: [RatingUserResponseDto],
  })
  async getRatingsByPhotographer(
    @Param('id', ParseIntPipe) photographerId: number,
    @Res() res: Response,
  ) {
    const result = await this.ratingsService.getRatingsByPhotographer(photographerId);
    return res.status(HttpStatus.OK).json(result);
  }

}
