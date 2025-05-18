import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ServicesService } from '../services/services.service';
import { BookingState } from './enums/booking-state.enum';
import { S3Service } from 'src/s3/s3.service';
import { NotificationsService } from 'src/notifications/notifications.service';

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingService: jest.Mocked<BookingsService>;

  const mockBooking = {
    id: 1,
    service: {
      name: 'Sesión',
      price: 100,
    },
    date: new Date('2025-06-01T10:00:00Z'),
    client: {
      name: 'Laura',
      email: 'laura@example.com',
    },
    state: BookingState.PENDING,
  };

  const mockBookingService: Partial<jest.Mocked<BookingsService>> = {
    createBooking: jest.fn().mockResolvedValue(mockBooking),
    updateBookingStatus: jest
      .fn()
      .mockResolvedValue({ ...mockBooking, state: BookingState.ACTIVE }),
    getClientBookingHistory: jest.fn().mockResolvedValue([]),
    getServicesToRate: jest.fn().mockResolvedValue([]),
    findPendingByPhotographer: jest.fn().mockResolvedValue([]),
    findPendingByClient: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BookingsService, useValue: mockBookingService },
        { provide: ServicesService, useValue: {} },
        { provide: S3Service, useValue: {} },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    bookingService = module.get(BookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBooking', () => {
    it('should return booking response DTO', async () => {
      const req: any = { user: { userId: 1 } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.createBooking(
        { serviceId: 2, dateTime: '2025-06-01T10:00:00Z', bookedMinutes: 120 },
        req,
        res,
      );

      expect(bookingService.createBooking).toHaveBeenCalledWith(
        1,
        2,
        new Date('2025-06-01T10:00:00Z'),
        120,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: 1,
          status: BookingState.PENDING,
        }),
      );
    });
  });

  describe('confirmBooking', () => {
    it('should confirm booking and return updated response', async () => {
      const req: any = { user: { userId: 99 } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.confirmBooking(1, req, res);

      expect(bookingService.updateBookingStatus).toHaveBeenCalledWith(
        1,
        99,
        BookingState.ACTIVE,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: 1,
          status: BookingState.ACTIVE,
        }),
      );
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking and return updated response', async () => {
      const req: any = { user: { userId: 99 } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockBookingService.updateBookingStatus = jest
        .fn()
        .mockResolvedValue({ ...mockBooking, state: BookingState.CANCELLED });

      await controller.cancelBooking(1, req, res);

      expect(bookingService.updateBookingStatus).toHaveBeenCalledWith(
        1,
        99,
        BookingState.CANCELLED,
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BookingState.CANCELLED,
        }),
      );
    });
  });

  it('should return client history', async () => {
    const req: any = { user: { userId: 3 } };
    const result = await controller.getClientHistory(req);
    expect(bookingService.getClientBookingHistory).toHaveBeenCalledWith(3);
    expect(result).toEqual([]);
  });

  it('should return services to rate', async () => {
    const req: any = { user: { userId: 3 } };
    const result = await controller.getServicesToRate(req);
    expect(bookingService.getServicesToRate).toHaveBeenCalledWith(3);
    expect(result).toEqual([]);
  });

  it('should return pending bookings for photographer', async () => {
    const req: any = { user: { userId: 7, role: 'PHOTOGRAPHER' } }; // <- añadimos el rol
    const result = await controller.getPendingPhotographer(req);
    expect(bookingService.findPendingByPhotographer).toHaveBeenCalledWith(7);
    expect(result).toEqual([]);
  });

  it('should return pending bookings for client', async () => {
    const req: any = { user: { userId: 8, role: 'CLIENT' } }; // <- añadimos el rol
    const result = await controller.getPendingClient(req);
    expect(bookingService.findPendingByClient).toHaveBeenCalledWith(8);
    expect(result).toEqual([]);
  });
});
