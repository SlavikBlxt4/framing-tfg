import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { BookingState } from './enums/booking-state.enum';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';
import { BookingHistoryDto } from './dto/booking-history.dto';
import { BookingInfoDto } from './dto/booking-info.dto';
import { ServiceToRateDto } from './dto/service-to-rate.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { BookingResumenDto } from './dto/booking-resumen.dto';
import { S3Service } from '../s3/s3.service'; // ya lo tienes en tu módulo
dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

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
    bookedMinutes: number,
  ): Promise<Booking> {
    // 1) Validar cliente
    const client = await this.userRepo.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    // 2) Validar servicio
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
      relations: ['photographer'],
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    // 3) Fecha futura
    const now = new Date();
    if (date <= now) {
      throw new ConflictException(
        'No se puede reservar un servicio para una fecha pasada',
      );
    }

    // 4) Disponibilidad
    const existing = await this.bookingRepo.find({
      where: { service: { id: serviceId } },
    });
    for (const b of existing) {
      if (b.date.getTime() === date.getTime()) {
        throw new ConflictException(
          'El servicio ya está reservado para esa fecha y hora',
        );
      }
    }

    // 5) Crear y guardar (aquí el trigger pondrá NEW.price)
    const booking = this.bookingRepo.create({
      client,
      service,
      date,
      bookingDate: now,
      bookedMinutes,
      state: BookingState.PENDING,
    });
    const saved = await this.bookingRepo.save(booking);

    // 6) Intentar recargar con price + relaciones
    const fullBooking = await this.bookingRepo.findOne({
      where: { id: saved.id },
      relations: ['service', 'service.photographer', 'client'],
    });

    // Si el mock de findOne devuelve undefined, devolvemos saved
    return fullBooking ?? saved;
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

  async getClientBookingHistory(
    clientId: number,
  ): Promise<BookingHistoryDto[]> {
    const bookings = await this.bookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.service', 's')
      .where('b.client.id = :clientId', { clientId })
      .orderBy('b.bookingDate', 'DESC')
      .getMany();

    return bookings.map((b) => ({
      bookingId: b.id,
      serviceId: b.service.id,
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

  async findPendingByPhotographer(
    photographerId: number,
  ): Promise<BookingInfoDto[]> {
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

  // METODO PARA CALCULAR LAS HORAS DISPONIBLES PARA UNA RESERVA DE UN FOTOGRAFO (miramos su horario, lo dividimos segun el tiempo del servicio a reservar, y restamos las horas ocupadas en esa fecha; devolvemos las horas disponibles)
  async checkAvailability(dto: CheckAvailabilityDto): Promise<string[]> {
    const { photographerId, date, duration } = dto;
    const now = dayjs();

    const dayOfWeek = new Date(date).getDay(); // 0=domingo... 6=sábado
    const weekDayId = dayOfWeek === 0 ? 7 : dayOfWeek;

    const availability = await this.bookingRepo.query(
      `
      SELECT s.starting_hour, s.ending_hour
      FROM photographer_availability pa
      JOIN schedule s ON pa.schedule_id = s.id
      WHERE pa.photographer_id = $1 AND pa.day_id = $2
      `,
      [photographerId, weekDayId],
    );

    const possibleSlots: string[] = [];

    for (const slot of availability) {
      const start = dayjs(`${date}T${slot.starting_hour}`);
      const end = dayjs(`${date}T${slot.ending_hour}`);

      let current = start;

      while (current.add(duration, 'minute').isSameOrBefore(end)) {
        if (current.isAfter(now)) {
          possibleSlots.push(current.format('HH:mm'));
        }
        current = current.add(duration, 'minute');
      }
    }

    const bookings = await this.getPhotographerBookingsForDay(
      photographerId,
      date,
    );

    const slotObjects = possibleSlots.map((timeStr) => {
      const start = dayjs(`${date}T${timeStr}`);
      const end = start.add(duration, 'minute');
      return { time: timeStr, start, end };
    });

    const availableSlots = slotObjects.filter((slot) => {
      for (const booking of bookings) {
        const overlaps =
          slot.start.isBefore(booking.end) && slot.end.isAfter(booking.start);

        if (overlaps) {
          console.log(
            `❌ Slot ${slot.time} (${slot.start.format('HH:mm')} - ${slot.end.format('HH:mm')}) choca con reserva: ${booking.start.format('HH:mm')} - ${booking.end.format('HH:mm')}`,
          );
          return false;
        } else {
          console.log(
            `✅ Slot ${slot.time} (${slot.start.format('HH:mm')} - ${slot.end.format('HH:mm')}) NO choca con reserva: ${booking.start.format('HH:mm')} - ${booking.end.format('HH:mm')}`,
          );
        }
      }
      return true;
    });

    return availableSlots.map((slot) => slot.time);
  }

  // Pedimos a la bbdd los bookings pendientes y activas del fotógrafo para un dia en concreto
  private async getPhotographerBookingsForDay(
    photographerId: number,
    date: string,
  ): Promise<{ start: dayjs.Dayjs; end: dayjs.Dayjs }[]> {
    const startOfDay = dayjs(date).startOf('day');
    const endOfDay = dayjs(date).endOf('day');

    const rawBookings = await this.bookingRepo
      .createQueryBuilder('b')
      .leftJoin('b.service', 's')
      .where('s.photographer_id = :photographerId', { photographerId })
      .andWhere('b.state IN (:...states)', {
        states: [BookingState.PENDING, BookingState.ACTIVE],
      })
      .andWhere('b.date BETWEEN :start AND :end', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
      })
      .select(['b.date AS date', 'b.booked_minutes AS booked_minutes'])
      .getRawMany();

    console.log('📦 Bookings encontrados:');
    for (const b of rawBookings) {
      console.log(`  - Fecha: ${b.date}, Duración: ${b.booked_minutes}`);
      if (!b.booked_minutes) {
        console.warn('⚠️ Reserva sin duración válida:', b);
      }
    }

    return rawBookings.map((b) => {
      const start = dayjs(b.date);
      const end = start.add(b.booked_minutes, 'minute');
      return { start, end };
    });
  }

  async findById(id: number): Promise<Booking | null> {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ['service', 'service.photographer', 'client'],
    });
  }

  async setUrlImagesIfMissing(id: number, url: string): Promise<void> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (booking && !booking.urlImages) {
      booking.urlImages = url;
      await this.bookingRepo.save(booking);
    }
  }
  async findByIdWithServiceAndClient(id: number): Promise<Booking | null> {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ['service', 'service.photographer', 'client'],
    });
  }

  async cancelBookingByClient(
    bookingId: number,
    clientId: number,
  ): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['client', 'service', 'service.photographer'],
    });

    if (!booking) throw new NotFoundException('Reserva no encontrada');
    if (booking.client.id !== clientId) {
      throw new ForbiddenException('No autorizado para cancelar esta reserva');
    }

    booking.state = BookingState.CANCELLED;
    return this.bookingRepo.save(booking);
  }

  async findAgendaNext5DaysByPhotographer(photographerId: number) {
    const now = dayjs().startOf('day');
    const fiveDaysLater = now.add(5, 'day').endOf('day');

    const results = await this.bookingRepo.query(
      `
        SELECT b.id as "bookingId",
              b.client_id as "clientId",
              b.booking_date as "bookingDate",
              b.state as "state",
              s.id as "serviceId",
              s.name as "serviceName",
              s.price as "price",
              u.name as "clientName",
              u.email as "clientEmail",
              b.date as "date",
              b.booked_minutes as "bookedMinutes"
        FROM booking b
        JOIN service s ON b.service_id = s.id
        JOIN users u ON b.client_id = u.id
        WHERE s.photographer_id = $1
          AND b.state = 'active'
          AND b.date BETWEEN $2 AND $3
        ORDER BY b.date ASC
      `,
      [photographerId, now.toISOString(), fiveDaysLater.toISOString()],
    );

    const agenda = [];

    for (let i = 0; i <= 5; i++) {
      const currentDate = now.add(i, 'day');
      const label = currentDate.format('ddd, D MMM'); // ej: "Mié, 15 May"

      const daySessions = results.filter((r) =>
        dayjs(r.date).isSame(currentDate, 'day'),
      );

      agenda.push({
        date: currentDate.toISOString(),
        label, // lo puedes usar como encabezado
        sessions: daySessions,
      });
    }

    return agenda;
  }

  async getCompletedBookingsWithoutImages(photographerId: number) {
    return this.bookingRepo.query(
      `
      SELECT 
        b.id AS "bookingId",
        b.date AS "sessionDate",
        u.name AS "clientName",
        s.name AS "serviceName"
      FROM booking b
      JOIN service s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE s.photographer_id = $1
        AND b.state = 'done'
        AND b.url_images IS NULL
      ORDER BY b.date DESC
      `,
      [photographerId],
    );
  }

  async findNextActiveBooking(
    clientId: number,
  ): Promise<{ photographerName: string; date: Date } | null> {
    const result = await this.bookingRepo.query(
      `
      SELECT u.name AS "photographerName", b.date
      FROM booking b
      JOIN service s ON b.service_id = s.id
      JOIN users u ON s.photographer_id = u.id
      WHERE b.client_id = $1
        AND b.state = 'active'
        AND b.date > NOW()
      ORDER BY b.date ASC
      LIMIT 1
      `,
      [clientId],
    );

    return result.length > 0 ? result[0] : null;
  }

  async getClientBookingsResumen(
    clientId: number,
  ): Promise<BookingResumenDto[]> {
    const bookings = await this.bookingRepo.find({
      where: {
        client: { id: clientId },
        urlImages: Not(IsNull()),
      },
      relations: ['service', 'service.photographer'],
      order: { date: 'DESC' },
    });

    const resultados: BookingResumenDto[] = [];

    for (const booking of bookings) {
      const url = booking.urlImages;
      const prefix = this.extractPrefixFromUrl(url);

      const s3Service = new S3Service(); // Asegúrate de que S3Service esté correctamente inyectado o instanciado

      const keys = await s3Service.listRawKeysInPrefix(prefix);
      resultados.push({
        bookingId: booking.id,
        photographerName: booking.service.photographer.name,
        date: booking.date.toISOString(),
        imageCount: keys.length,
      });
    }

    return resultados;
  }

  // método auxiliar privado (añádelo en BookingsService)
  private extractPrefixFromUrl(url: string): string {
    // Ej: https://<bucket>.s3.<region>.amazonaws.com/booking/123/
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1); // elimina el '/' inicial
  }
}
