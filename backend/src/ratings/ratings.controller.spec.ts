import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { RatingUserResponseDto } from './dto/rating-user-response.dto';
import { RatingHistoryResponseDto } from './dto/rating-history-response.dto';

describe('RatingsController', () => {
  let controller: RatingsController;
  let ratingsService: jest.Mocked<RatingsService>;

  const mockRatingsService: Partial<jest.Mocked<RatingsService>> = {
    createRating: jest.fn(),
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

  describe('rateService', () => {
    it('should return created rating', async () => {
      const dto: CreateRatingDto = {
        serviceId: 10,
        ratingValue: 4,
        comment: 'Muy bueno',
      };

      const expected: RatingResponseDto = {
        id: 123,
        serviceId: 10,
        clientId: 1,
        rating: 4,
        comment: 'Muy bueno',
      };

      ratingsService.createRating.mockResolvedValue(expected);

      const req = { user: { userId: 1 } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.rateService(dto, req, res);

      expect(ratingsService.createRating).toHaveBeenCalledWith(dto, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expected);
    });
  });

  describe('getUserRatings', () => {
    it('should return user rating history', async () => {
      const history: RatingHistoryResponseDto[] = [
        {
          id: 1,
          rating: 5,
          comment: 'Excelente',
          fecha: '24/05/2025',
          serviceName: 'Sesión Retrato',
          photographerName: 'Juan Pérez',
          photographerId: 22,
          photographerAvatar: 'https://cdn.cosmos.so/default-avatar.jpg',
        },
      ];

      ratingsService.getUserRatings.mockResolvedValue(history);

      const req = { user: { userId: 1 } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.getUserRatings(req, res);

      expect(ratingsService.getUserRatings).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(history);
    });
  });

  describe('getRatingsByPhotographer', () => {
    it('should return ratings for a given photographer', async () => {
      const result: RatingUserResponseDto[] = [
        {
          nombre: 'Cliente 1',
          fecha: '24/05/2025',
          puntuacion: 5,
          comentario: 'Muy recomendable',
          avatarUrl: 'https://cdn.cosmos.so/default-avatar.jpg',
        },
      ];

      ratingsService.getRatingsByPhotographer.mockResolvedValue(result);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.getRatingsByPhotographer(22, res);

      expect(ratingsService.getRatingsByPhotographer).toHaveBeenCalledWith(22);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });
});
