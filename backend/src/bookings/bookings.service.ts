import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Booking } from './booking.entity';
  import { Repository } from 'typeorm';
  import { BookingState } from './enums/booking-state.enum';
  import { User } from '../users/user.entity';
  import { Service } from '../services/service.entity';
  import { BookingHistoryDto } from './dto/booking-history.dto';
  import { BookingInfoDto } from './dto/booking-info.dto';
  import { ServiceToRateDto } from './dto/service-to-rate.dto';
  
  @Injectable()
  export class BookingsService {
    constructor(
      @InjectRepository(Booking)
      private readonly bookingRepo: Repository<Booking>,
  
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
  
      @InjectRepository(Service)
      private readonly serviceRepo: Repository<Service>,
  
    ) {}
  
    async createBooking(
      clientId: number,
      serviceId: number,
      date: Date,
    ): Promise<Booking> {
      const client = await this.userRepo.findOne({ where: { id: clientId } });
      if (!client) throw new NotFoundException('Cliente no encontrado');
  
      const service = await this.serviceRepo.findOne({ where: { id: serviceId }, relations: ['photographer'] });
      if (!service) throw new NotFoundException('Servicio no encontrado');
  
      // Verificar disponibilidad (no permitir doble reserva en misma fecha)
      const existing = await this.bookingRepo.find({
        where: { service: { id: serviceId } },
      });
  
      for (const b of existing) {
        if (b.date.getTime() === new Date(date).getTime()) {
          throw new ConflictException('El servicio ya está reservado para esa fecha y hora');
        }
      }
  
      const booking = this.bookingRepo.create({
        client,
        service,
        date,
        bookingDate: new Date(),
        state: BookingState.PENDING,
      });
  

  
      return this.bookingRepo.save(booking);
    }
  
    async updateBookingStatus(
      bookingId: number,
      photographerId: number,
      newStatus: BookingState,
    ): Promise<Booking> {
      const booking = await this.bookingRepo.findOne({
        where: { id: bookingId },
        relations: ['service', 'service.photographer', 'client'],
      });
  
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.service.photographer.id !== photographerId) {
        throw new ForbiddenException('No autorizado para modificar esta reserva');
      }
  
      booking.state = newStatus;
      const updated = await this.bookingRepo.save(booking);
  

  
      return updated;
    }
  
    async getClientBookingHistory(clientId: number): Promise<BookingHistoryDto[]> {
      const bookings = await this.bookingRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.service', 's')
        .where('b.client.id = :clientId', { clientId })
        .orderBy('b.bookingDate', 'DESC')
        .getMany();
  
      return bookings.map((b) => ({
        bookingId: b.id,
        serviceName: b.service.name,
        bookingDate: b.bookingDate,
        date: b.date,
        status: b.state,
      }));
    }
  
    async getServicesToRate(clientId: number): Promise<ServiceToRateDto[]> {
      return this.bookingRepo.query(
        `
        SELECT s.id AS "serviceId",
               s.name AS "serviceName",
               s.description AS "serviceDescription",
               s.price AS "price",
               s.image_url AS "imageUrl",
               b.id AS "bookingId",
               b.booking_date AS "bookingDate",
               b.date AS "serviceDate"
        FROM booking b
        JOIN service s ON b.service_id = s.id
        WHERE b.client_id = $1
          AND b.state = 'done'
          AND s.id NOT IN (
            SELECT r.service_id
            FROM rating r
            WHERE r.client_id = $1
          )
        `,
        [clientId],
      );
    }
  
    async findPendingByPhotographer(photographerId: number): Promise<BookingInfoDto[]> {
      return this.bookingRepo.query(
        `
        SELECT b.id as "bookingId",
               b.client_id as "clientId",
               b.booking_date as "bookingDate",
               b.state as "state",
               s.id as "serviceId",
               s.name as "serviceName",
               s.price as "price",
               u.name as "clientName",
               u.email as "clientEmail"
        FROM booking b
        JOIN service s ON b.service_id = s.id
        JOIN users u ON b.client_id = u.id
        WHERE s.photographer_id = $1 AND b.state = 'pending'
        `,
        [photographerId],
      );
    }
  
    async findPendingByClient(clientId: number): Promise<BookingInfoDto[]> {
      return this.bookingRepo.query(
        `
        SELECT b.id as "bookingId",
               b.client_id as "clientId",
               b.booking_date as "bookingDate",
               b.state as "state",
               s.id as "serviceId",
               s.name as "serviceName",
               s.price as "price",
               u.name as "photographerName",
               u.email as "photographerEmail"
        FROM booking b
        JOIN service s ON b.service_id = s.id
        JOIN users u ON s.photographer_id = u.id
        WHERE b.client_id = $1 AND b.state = 'pending'
        `,
        [clientId],
      );
    }
  }
  