import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';

describe('RatingsService', () => {
  let service: RatingsService;
  let ratingRepo: jest.Mocked<Repository<Rating>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let serviceRepo: jest.Mocked<Repository<Service>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: getRepositoryToken(Rating),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
        },
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
        {
          provide: getRepositoryToken(Service),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    ratingRepo = module.get(getRepositoryToken(Rating));
    userRepo = module.get(getRepositoryToken(User));
    serviceRepo = module.get(getRepositoryToken(Service));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRating', () => {
    const dto: CreateRatingDto = {
      serviceId: 10,
      ratingValue: 5,
      comment: 'Muy buen servicio',
    };

    it('should throw if client not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.createRating(dto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if service not found', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      serviceRepo.findOne.mockResolvedValue(null);
      await expect(service.createRating(dto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if rating already exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      serviceRepo.findOne.mockResolvedValue({ id: 10 } as Service);
      ratingRepo.findOne.mockResolvedValue({ id: 99 } as Rating);

      await expect(service.createRating(dto, 1)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create and return a new rating', async () => {
      const client = { id: 1 } as User;
      const serviceEntity = { id: 10 } as Service;

      userRepo.findOne.mockResolvedValue(client);
      serviceRepo.findOne.mockResolvedValue(serviceEntity);
      ratingRepo.findOne.mockResolvedValue(null);

      const createdRating = {
        service: serviceEntity,
        client,
        rating: dto.ratingValue,
        comment: dto.comment,
      };

      const savedRating = {
        id: 123,
        ...createdRating,
      };

      ratingRepo.create.mockReturnValue(createdRating as Rating);
      ratingRepo.save.mockResolvedValue(savedRating as Rating);

      const result = await service.createRating(dto, client.id);

      expect(result).toEqual({
        id: 123,
        serviceId: 10,
        clientId: 1,
        rating: 5,
        comment: 'Muy buen servicio',
      });

      expect(ratingRepo.create).toHaveBeenCalledWith(createdRating);
      expect(ratingRepo.save).toHaveBeenCalledWith(createdRating);
    });
  });
});
