import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { Repository } from 'typeorm';

describe('RatingsService', () => {
  let service: RatingsService;
  let ratingRepo: jest.Mocked<Repository<Rating>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: getRepositoryToken(Rating),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    ratingRepo = module.get(getRepositoryToken(Rating));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRatings', () => {
    it('should return formatted ratings from user', async () => {
      const mockRatings = [
        {
          id: 1,
          rating: 5,
          comment: 'Excelente',
          createdAt: new Date('2025-05-24T10:00:00Z'),
          service: {
            name: 'Sesión Retrato',
            photographer: {
              id: 22,
              name: 'Fotógrafo 1',
              url_profile_image: null,
            },
          },
        },
      ];

      ratingRepo.find.mockResolvedValue(mockRatings as any);

      const result = await service.getUserRatings(1);

      expect(result).toEqual([
        {
          id: 1,
          rating: 5,
          comment: 'Excelente',
          fecha: new Date('2025-05-24T10:00:00Z').toLocaleDateString('es-ES'),
          serviceName: 'Sesión Retrato',
          photographerName: 'Fotógrafo 1',
          photographerId: 22,
          photographerAvatar: 'https://cdn.cosmos.so/default-avatar.jpg',
        },
      ]);
    });
  });

  describe('getRatingsByPhotographer', () => {
    it('should return formatted ratings by photographerId', async () => {
      const mockRatings = [
        {
          rating: 4,
          comment: 'Muy bueno',
          createdAt: new Date('2025-05-24T12:00:00Z'),
          client: {
            name: 'Cliente 1',
            url_profile_image: null,
          },
        },
      ];

      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRatings),
      };

      jest
        .spyOn(ratingRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      const result = await service.getRatingsByPhotographer(22);

      expect(result).toEqual([
        {
          nombre: 'Cliente 1',
          fecha: new Date('2025-05-24T12:00:00Z').toLocaleDateString('es-ES'),
          puntuacion: 4,
          comentario: 'Muy bueno',
          avatarUrl: 'https://cdn.cosmos.so/default-avatar.jpg',
        },
      ]);
    });
  });
});
