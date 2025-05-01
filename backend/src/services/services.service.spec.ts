import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { User, UserRole } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ServicesService', () => {
  let service: ServicesService;
  let serviceRepo: jest.Mocked<Repository<Service>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let categoryRepo: jest.Mocked<Repository<Category>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            query: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
        {
          provide: getRepositoryToken(Category),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    serviceRepo = module.get(getRepositoryToken(Service));
    userRepo = module.get(getRepositoryToken(User));
    categoryRepo = module.get(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createService', () => {
    const dto = {
      name: 'Sesión boda',
      description: 'Paquete para bodas',
      price: 300,
      imageUrl: 'img.jpg',
      categoryId: 5,
      minimum_minutes: 120,
      discount: 10,
    };

    it('should throw if photographer not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.createService(dto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if user is not a photographer', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        role: UserRole.CLIENT,
      } as User);
      await expect(service.createService(dto, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw if category not found', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        role: UserRole.PHOTOGRAPHER,
      } as User);
      categoryRepo.findOne.mockResolvedValue(null);
      await expect(service.createService(dto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create and save the service', async () => {
      const photographer = { id: 1, role: UserRole.PHOTOGRAPHER } as User;
      const category = { id: 5, name: 'Retrato' } as Category;
      const mockService = { id: 10, name: dto.name } as Service;

      userRepo.findOne.mockResolvedValue(photographer);
      categoryRepo.findOne.mockResolvedValue(category);
      serviceRepo.create.mockReturnValue(mockService);
      serviceRepo.save.mockResolvedValue(mockService);

      const result = await service.createService(dto, photographer.id);
      expect(result).toEqual(mockService);
      expect(serviceRepo.save).toHaveBeenCalledWith(mockService);
    });
  });

  describe('getTop10HighestRatedServices', () => {
    it('should call serviceRepo.query and return result', async () => {
      const mockResult = [{ id: 1, name: 'S1', avg_rating: 4.5 }];
      serviceRepo.query.mockResolvedValue(mockResult);
      const result = await service.getTop10HighestRatedServices();
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteService', () => {
    it('should return false if service not found', async () => {
      serviceRepo.findOne.mockResolvedValue(null);
      const result = await service.deleteService(1, 1);
      expect(result).toBe(false);
    });

    it('should return false if photographer is not owner', async () => {
      serviceRepo.findOne.mockResolvedValue({
        photographer: { id: 2 },
      } as Service);
      const result = await service.deleteService(1, 1);
      expect(result).toBe(false);
    });

    it('should remove the service and return true', async () => {
      const serviceEntity = { id: 1, photographer: { id: 1 } } as Service;
      serviceRepo.findOne.mockResolvedValue(serviceEntity);
      serviceRepo.remove.mockResolvedValue(undefined);

      const result = await service.deleteService(1, 1);
      expect(result).toBe(true);
    });
  });

  describe('findServiceById', () => {
    it('should return service with relations', async () => {
      const svc = { id: 5, name: 'Boda' } as Service;
      serviceRepo.findOne.mockResolvedValue(svc);
      const result = await service.findServiceById(5);
      expect(result).toBe(svc);
    });

    it('should throw if not found', async () => {
      serviceRepo.findOne.mockResolvedValue(null);
      await expect(service.findServiceById(5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getServicesByCategoryName', () => {
    it('should return services as DTOs', async () => {
      const mockServices = [
        {
          id: 1,
          name: 'Producto',
          description: 'Foto de productos',
          price: 90,
          imageUrl: 'foto.jpg',
          category: { name: 'Producto' },
        },
      ];

      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockServices),
      };

      serviceRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getServicesByCategoryName('producto');
      expect(result[0]).toEqual({
        id: 1,
        name: 'Producto',
        description: 'Foto de productos',
        price: 90,
        imageUrl: 'foto.jpg',
        categoryName: 'Producto',
      });
    });
  });
});
