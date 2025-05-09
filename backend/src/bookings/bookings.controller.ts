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
  ForbiddenException,
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
import { CheckAvailabilityDto } from './dto/check-availability.dto';
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ver reservas pendientes del fotógrafo autenticado',
  })
  @ApiResponse({ status: 200, type: [BookingInfoDto] })
  @ApiResponse({ status: 403, description: 'Solo fotógrafos pueden acceder' })
  async getPendingPhotographer(@Req() req: Request): Promise<BookingInfoDto[]> {
    const user = req.user;
    if (user['role'] !== 'PHOTOGRAPHER') {
      throw new ForbiddenException(
        'Solo los fotógrafos pueden acceder a esta ruta',
      );
    }

    return this.bookingService.findPendingByPhotographer(user['userId']);
  }

  @Get('pending-bookings-client')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ver reservas pendientes del cliente autenticado',
  })
  @ApiResponse({ status: 200, type: [BookingInfoDto] })
  @ApiResponse({ status: 403, description: 'Solo clientes pueden acceder' })
  async getPendingClient(@Req() req: Request): Promise<BookingInfoDto[]> {
    const user = req.user;
    if (user['role'] !== 'CLIENT') {
      throw new ForbiddenException(
        'Solo los clientes pueden acceder a esta ruta',
      );
    }

    return this.bookingService.findPendingByClient(user['userId']);
  }

  // METODO PARA CALCULAR LAS HORAS DISPONIBLES PARA UNA RESERVA DE UN FOTOGRAFO (miramos su horario, lo dividimos segun el tiempo del servicio a reservar, y restamos las horas ocupadas en esa fecha; devolvemos las horas disponibles)
  @Post('check-availability')
  @ApiOperation({
    summary: 'Consultar disponibilidad de un fotógrafo para un día específico',
    description: `Consulta las franjas horarias libres para un fotógrafo en una fecha concreta.
  
    Ejemplo con el fotógrafo ID 31:
    - Horario disponible los lunes:
      • 08:00 - 12:45
      • 16:00 - 18:15
    
    - Reservas actuales el 2025-05-12:
      • 08:45 - 09:00 (15 min)
      • 09:30 - 09:45 (15 min)
      • 16:30 - 17:30 (60 min)
    
    Si se consulta con duración de 60 minutos, la respuesta será:
    ["10:00", "11:00"]
    `,
  })
  @ApiBody({ type: CheckAvailabilityDto })
  @ApiResponse({
    status: 200,
    description: 'Array de horas disponibles',
    schema: {
      example: {
        availableSlots: ['10:00', '11:00'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async checkAvailability(
    @Body() dto: CheckAvailabilityDto,
    @Res() res: Response,
  ) {
    const availableSlots = await this.bookingService.checkAvailability(dto);
    return res.status(HttpStatus.OK).json({ availableSlots });
  }
}
