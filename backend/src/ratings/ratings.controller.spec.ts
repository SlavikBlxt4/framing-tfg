import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { RatingUserResponseDto } from './dto/rating-user-response.dto';
import { RatingHistoryResponseDto } from './dto/rating-history-response.dto';

describe('RatingsController', () => {
  let controller: RatingsController;
  let ratingsService: jest.Mocked<RatingsService>;

  const mockRatingsService: Partial<jest.Mocked<RatingsService>> = {
    getUserRatings: jest.fn(),
    getRatingsByPhotographer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        {
          provide: RatingsService,
          useValue: mockRatingsService,
        },
      ],
    }).compile();

    controller = module.get<RatingsController>(RatingsController);
    ratingsService = module.get(RatingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserRatings', () => {
    it('should return user rating history', async () => {
      const mockHistory: RatingHistoryResponseDto[] = [
        {
          id: 1,
          rating: 5,
          comment: 'Muy bueno',
          fecha: '24/05/2025',
          serviceName: 'Retrato',
          photographerName: 'Juan',
          photographerId: 22,
          photographerAvatar: 'https://cdn.cosmos.so/default-avatar.jpg',
        },
      ];

      ratingsService.getUserRatings.mockResolvedValue(mockHistory);

      const req = { user: { userId: 1 } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

      await controller.getUserRatings(req, res);

      expect(ratingsService.getUserRatings).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockHistory);
    });
  });

  describe('getRatingsByPhotographer', () => {
    it('should return ratings for photographer by ID', async () => {
      const mockRatings: RatingUserResponseDto[] = [
        {
          nombre: 'Cliente',
          fecha: '24/05/2025',
          puntuacion: 5,
          comentario: 'Excelente',
          avatarUrl: 'https://cdn.cosmos.so/default-avatar.jpg',
        },
      ];

      ratingsService.getRatingsByPhotographer.mockResolvedValue(mockRatings);

      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

      await controller.getRatingsByPhotographer(22, res);

      expect(ratingsService.getRatingsByPhotographer).toHaveBeenCalledWith(22);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRatings);
    });
  });
});
