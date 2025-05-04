import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';
import { Repository } from 'typeorm';
import { BookingState } from './enums/booking-state.enum';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepo: jest.Mocked<Repository<Booking>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let serviceRepo: jest.Mocked<Repository<Service>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            query: jest.fn(),
          },
        },
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
        {
          provide: getRepositoryToken(Service),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(BookingsService);
    bookingRepo = module.get(getRepositoryToken(Booking));
    userRepo = module.get(getRepositoryToken(User));
    serviceRepo = module.get(getRepositoryToken(Service));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    it('should throw if client not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createBooking(1, 1, new Date(), 120),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if service not found', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      serviceRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createBooking(1, 2, new Date(), 120),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if date is already booked', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10); // 10 days from now

      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      serviceRepo.findOne.mockResolvedValue({
        id: 2,
        photographer: {},
      } as Service);
      bookingRepo.find.mockResolvedValue([{ date: futureDate } as Booking]);

      await expect(
        service.createBooking(1, 2, futureDate, 120),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if booking date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // 1 day before now

      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      serviceRepo.findOne.mockResolvedValue({
        id: 2,
        photographer: {},
      } as Service);

      await expect(service.createBooking(1, 2, pastDate, 120)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create and save a new booking', async () => {
      const mockNow = new Date('2026-05-01T10:00:00Z');
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => mockNow.getTime());

      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      serviceRepo.findOne.mockResolvedValue({
        id: 2,
        photographer: {},
      } as Service);
      bookingRepo.find.mockResolvedValue([]);
      const newBooking = { id: 99 } as Booking;
      bookingRepo.create.mockReturnValue(newBooking);
      bookingRepo.save.mockResolvedValue(newBooking);

      const result = await service.createBooking(
        1,
        2,
        new Date('2026-05-02T10:00:00Z'),
        120,
      );
      expect(result).toEqual(newBooking);

      jest.restoreAllMocks(); // Restore original Date behavior
    });
  });

  describe('updateBookingStatus', () => {
    it('should throw if booking not found', async () => {
      bookingRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateBookingStatus(1, 1, BookingState.DONE),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if photographer is not authorized', async () => {
      bookingRepo.findOne.mockResolvedValue({
        id: 1,
        service: { photographer: { id: 999 } },
      } as any);

      await expect(
        service.updateBookingStatus(1, 1, BookingState.DONE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update and save the booking status', async () => {
      const mockBooking = {
        id: 1,
        service: { photographer: { id: 1 } },
        state: BookingState.PENDING,
      } as any;

      bookingRepo.findOne.mockResolvedValue(mockBooking);
      bookingRepo.save.mockResolvedValue({
        ...mockBooking,
        state: BookingState.DONE,
      });

      const result = await service.updateBookingStatus(1, 1, BookingState.DONE);
      expect(result.state).toBe(BookingState.DONE);
    });
  });

  describe('getClientBookingHistory', () => {
    it('should return formatted booking history', async () => {
      const mockGetMany = jest.fn().mockResolvedValue([
        {
          id: 1,
          bookingDate: new Date('2025-01-01'),
          date: new Date('2025-01-02'),
          state: BookingState.DONE,
          service: { name: 'Retrato' },
        },
      ]);

      bookingRepo.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: mockGetMany,
      }) as any;

      const result = await service.getClientBookingHistory(1);
      expect(result[0].serviceName).toBe('Retrato');
    });
  });

  describe('getServicesToRate', () => {
    it('should return raw services to rate', async () => {
      const mockResult = [{ serviceId: 1, serviceName: 'Boda' }];
      bookingRepo.query.mockResolvedValue(mockResult);
      const result = await service.getServicesToRate(5);
      expect(result).toEqual(mockResult);
      expect(bookingRepo.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [5],
      );
    });
  });

  describe('findPendingByPhotographer', () => {
    it('should return pending bookings by photographer', async () => {
      const data = [{ bookingId: 1, serviceName: 'Sesión' }];
      bookingRepo.query.mockResolvedValue(data);
      const result = await service.findPendingByPhotographer(7);
      expect(result).toEqual(data);
      expect(bookingRepo.query).toHaveBeenCalledWith(expect.any(String), [7]);
    });
  });

  describe('findPendingByClient', () => {
    it('should return pending bookings by client', async () => {
      const data = [{ bookingId: 2, serviceName: 'Producto' }];
      bookingRepo.query.mockResolvedValue(data);
      const result = await service.findPendingByClient(3);
      expect(result).toEqual(data);
      expect(bookingRepo.query).toHaveBeenCalledWith(expect.any(String), [3]);
    });
  });
});
