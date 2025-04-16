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

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookingService: BookingsService,
    private readonly servicesService: ServicesService,
  ) {}

  @Post('create')
  async createBooking(
    @Body() dto: CreateBookingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const clientId = req.user['userId'];
    const serviceId = dto.serviceId;
    const date = new Date(dto.dateTime);

    const booking = await this.bookingService.createBooking(
      clientId,
      serviceId,
      date,
    );

    const response: BookingResponseDto = {
      bookingId: booking.id,
      serviceName: booking.service.name,
      price: booking.service.price,
      date: booking.date.toISOString(),
      clientName: booking.client.name,
      clientEmail: booking.client.email,
      status: booking.state,
    };

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(':id/confirm')
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
    };

    return res.status(HttpStatus.OK).json(response);
  }

  @Post(':id/cancel')
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
    };

    return res.status(HttpStatus.OK).json(response);
  }

  @Get('history')
  async getClientHistory(@Req() req: Request): Promise<BookingHistoryDto[]> {
    const clientId = req.user['userId'];
    return this.bookingService.getClientBookingHistory(clientId);
  }

  @Get('services-to-rate')
  async getServicesToRate(@Req() req: Request): Promise<ServiceToRateDto[]> {
    const clientId = req.user['userId'];
    return this.bookingService.getServicesToRate(clientId);
  }

  @Get('pending-bookings-photographer')
  async getPendingPhotographer(@Req() req: Request): Promise<BookingInfoDto[]> {
    const photographerId = req.user['userId'];
    return this.bookingService.findPendingByPhotographer(photographerId);
  }

  @Get('pending-bookings-client')
  async getPendingClient(@Req() req: Request): Promise<BookingInfoDto[]> {
    const clientId = req.user['userId'];
    return this.bookingService.findPendingByClient(clientId);
  }
}
