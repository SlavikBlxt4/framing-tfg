import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { S3Service } from 'src/s3/s3.service';
import { BookingsService } from 'src/bookings/bookings.service';
import { ForbiddenException } from '@nestjs/common';
import { Readable } from 'stream';
import { NotificationsService } from 'src/notifications/notifications.service';

describe('UsersController - uploadSessionImages', () => {
  let controller: UsersController;

  const mockUsersService = {
    updateProfileImage: jest.fn(),
    setPortfolioUrlIfMissing: jest.fn(),
  };

  const mockS3Service = {
    uploadToPath: jest.fn(),
    getPublicBaseUrl: jest
      .fn()
      .mockImplementation((prefix: string) => `https://mock-bucket/${prefix}`),
  };

  const mockBookingsService = {
    findById: jest.fn(),
    setUrlImagesIfMissing: jest.fn(),
  };

  beforeEach(async () => {
    const mockNotificationsService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: BookingsService, useValue: mockBookingsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('debería subir imágenes de sesión si el fotógrafo es el dueño de la sesión', async () => {
    const userId = 99;
    const bookingId = 33;

    const req: any = {
      user: { userId, role: 'PHOTOGRAPHER' },
    };

    const files: Express.Multer.File[] = [
      {
        fieldname: 'files',
        originalname: 'foto1.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1234,
        buffer: Buffer.from('fake'),
        stream: Readable.from([]),
        destination: '',
        filename: '',
        path: '',
      },
      {
        fieldname: 'files',
        originalname: 'foto2.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1234,
        buffer: Buffer.from('fake'),
        stream: Readable.from([]),
        destination: '',
        filename: '',
        path: '',
      },
    ];

    // Booking que pertenece al fotógrafo
    mockBookingsService.findById.mockResolvedValue({
      id: bookingId,
      service: { photographer: { id: userId } },
      photographer: { id: userId },
      client: { id: 1 }, // Add any other nested properties your controller expects here
      session: {},
      images: [],
    });

    // Simula subida
    mockS3Service.uploadToPath.mockImplementation((key: string) =>
      Promise.resolve(`https://mock-bucket/${key}`),
    );

    const result = await controller.uploadSessionImages(
      bookingId.toString(),
      files,
      req,
    );

    expect(mockBookingsService.findById).toHaveBeenCalledWith(bookingId);
    expect(mockS3Service.uploadToPath).toHaveBeenCalledTimes(2);
    expect(mockBookingsService.setUrlImagesIfMissing).toHaveBeenCalledWith(
      bookingId,
      expect.stringContaining(`photographers/${userId}/sesiones/${bookingId}/`),
    );
    expect(result.uploaded).toHaveLength(2);
  });

  it('debería lanzar ForbiddenException si el fotógrafo no es dueño de la sesión', async () => {
    const req: any = {
      user: { userId: 101, role: 'PHOTOGRAPHER' },
    };
    const bookingId = 77;

    mockBookingsService.findById.mockResolvedValue({
      id: bookingId,
      service: { photographer: { id: 999 } }, // fotógrafo diferente
      client: { id: 1 }, // Add client property to avoid TypeError
    });

    await expect(
      controller.uploadSessionImages(bookingId.toString(), [], req),
    ).rejects.toThrow(ForbiddenException);
  });
});
