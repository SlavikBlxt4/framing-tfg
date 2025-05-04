import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request, Response } from 'express';
import { BookingState } from './enums/booking-state.enum';
import { BookingHistoryDto } from './dto/booking-history.dto';
import { ServiceToRateDto } from './dto/service-to-rate.dto';
import { BookingInfoDto } from './dto/booking-info.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ServicesService } from '../services/services.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingService: BookingsService,
    private readonly servicesService: ServicesService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Reserva creada',
    type: BookingResponseDto,
  })
  async createBooking(
    @Body() dto: CreateBookingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const clientId = req.user['userId'];
    const serviceId = dto.serviceId;
    const date = new Date(dto.dateTime);
    const bookedMinutes = dto.bookedMinutes;

    const booking = await this.bookingService.createBooking(
      clientId,
      serviceId,
      date,
      bookedMinutes,
    );

    const response: BookingResponseDto = {
      bookingId: booking.id,
      serviceName: booking.service.name,
      price: booking.service.price,
      date: booking.date.toISOString(),
      clientName: booking.client.name,
      clientEmail: booking.client.email,
      status: booking.state,
      bookedMinutes: booking.bookedMinutes,
    };

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirmar una reserva' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la reserva' })
  @ApiResponse({
    status: 200,
    description: 'Reserva confirmada',
    type: BookingResponseDto,
  })
  async confirmBooking(
    @Param('id') bookingId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const photographerId = req.user['userId'];

    const booking = await this.bookingService.updateBookingStatus(
      bookingId,
      photographerId,
      BookingState.ACTIVE,
    );

    const response: BookingResponseDto = {
      bookingId: booking.id,
      serviceName: booking.service.name,
      price: booking.service.price,
      date: booking.date.toISOString(),
      clientName: booking.client.name,
      clientEmail: booking.client.email,
      status: booking.state,
      bookedMinutes: booking.bookedMinutes,
    };

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una reserva' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la reserva' })
  @ApiResponse({
    status: 200,
    description: 'Reserva cancelada',
    type: BookingResponseDto,
  })
  async cancelBooking(
    @Param('id') bookingId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const photographerId = req.user['userId'];

    const booking = await this.bookingService.updateBookingStatus(
      bookingId,
      photographerId,
      BookingState.CANCELLED,
    );

    const response: BookingResponseDto = {
      bookingId: booking.id,
      serviceName: booking.service.name,
      price: booking.service.price,
      date: booking.date.toISOString(),
      clientName: booking.client.name,
      clientEmail: booking.client.email,
      status: booking.state,
      bookedMinutes: booking.bookedMinutes,
    };

    return res.status(HttpStatus.OK).json(response);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Ver historial de reservas del cliente autenticado',
  })
  @ApiResponse({ status: 200, type: [BookingHistoryDto] })
  async getClientHistory(@Req() req: Request): Promise<BookingHistoryDto[]> {
    const clientId = req.user['userId'];
    return this.bookingService.getClientBookingHistory(clientId);
  }

  @Get('services-to-rate')
  @ApiOperation({
    summary: 'Obtener servicios del cliente pendientes de valorar',
  })
  @ApiResponse({ status: 200, type: [ServiceToRateDto] })
  async getServicesToRate(@Req() req: Request): Promise<ServiceToRateDto[]> {
    const clientId = req.user['userId'];
    return this.bookingService.getServicesToRate(clientId);
  }

  @Get('pending-bookings-photographer')
  @ApiOperation({
    summary: 'Ver reservas pendientes del fotógrafo autenticado',
  })
  @ApiResponse({ status: 200, type: [BookingInfoDto] })
  async getPendingPhotographer(@Req() req: Request): Promise<BookingInfoDto[]> {
    const photographerId = req.user['userId'];
    return this.bookingService.findPendingByPhotographer(photographerId);
  }

  @Get('pending-bookings-client')
  @ApiOperation({ summary: 'Ver reservas pendientes del cliente autenticado' })
  @ApiResponse({ status: 200, type: [BookingInfoDto] })
  async getPendingClient(@Req() req: Request): Promise<BookingInfoDto[]> {
    const clientId = req.user['userId'];
    return this.bookingService.findPendingByClient(clientId);
  }
}
