import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';

describe('RatingsController', () => {
  let controller: RatingsController;
  let ratingsService: jest.Mocked<RatingsService>;

  const mockRatingsService: Partial<jest.Mocked<RatingsService>> = {
    createRating: jest.fn(),
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

      const req = {
        user: {
          userId: 1,
        },
      } as any;

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
});
