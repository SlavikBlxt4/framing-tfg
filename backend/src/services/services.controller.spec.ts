import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../categories/category.entity';
import { Repository } from 'typeorm';
import { ServiceResponseDto } from './dto/service-response.dto';
import { TopRatedServiceDto } from './dto/top-rated-service.dto';

describe('ServicesController', () => {
  let controller: ServicesController;
  let servicesService: jest.Mocked<ServicesService>;
  let categoryRepo: jest.Mocked<Repository<Category>>;

  const mockService: any = {
    id: 1,
    name: 'Sesión retrato',
    description: 'Fotos retrato',
    price: 100,
    category: { name: 'Retrato' },
  };

  const mockServicesService: Partial<jest.Mocked<ServicesService>> = {
    createService: jest.fn().mockResolvedValue(mockService),
    getTop10HighestRatedServices: jest.fn().mockResolvedValue([]),
    deleteService: jest.fn().mockResolvedValue(true),
    getServicesByCategoryName: jest.fn().mockResolvedValue([]),
  };

  const mockCategoryRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        { provide: ServicesService, useValue: mockServicesService },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    servicesService = module.get(ServicesService);
    categoryRepo = module.get(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createService', () => {
    it('should create service using categoryName', async () => {
      const req = { user: { userId: 1 } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      categoryRepo.findOne.mockResolvedValue({
        id: 5,
        name: 'Boda',
        description: 'Categoría para bodas',
        services: [],
      });

      await controller.createService(
        {
          name: 'Boda',
          description: 'Fotos de boda',
          price: 200,
          categoryId: null,
          categoryName: 'Boda',
          minimum_minutes: 120,
        },
        req,
        res,
      );

      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { name: 'Boda' },
      });
      expect(servicesService.createService).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 5 }),
        1,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Sesión retrato' }),
      );
    });

    it('should return 400 if category not found', async () => {
      const req = { user: { userId: 1 } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      categoryRepo.findOne.mockResolvedValue(null);

      await controller.createService(
        {
          name: 'Boda',
          description: 'Fotos de boda',
          price: 200,
          categoryId: null,
          categoryName: 'Inexistente',
          minimum_minutes: 120,
        },
        req,
        res,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Estilo no encontrado',
      });
    });
  });

  describe('getTopRated', () => {
    it('should return top rated services', async () => {
      const mockTop: TopRatedServiceDto[] = [
        {
          serviceId: 1,
          serviceName: 'Retrato',
          averageRating: 4.5,
        },
      ];
      mockServicesService.getTop10HighestRatedServices = jest
        .fn()
        .mockResolvedValue(mockTop);

      const result = await controller.getTopRated();
      expect(result).toEqual(mockTop);
      expect(servicesService.getTop10HighestRatedServices).toHaveBeenCalled();
    });
  });

  describe('deleteService', () => {
    it('should return 200 when service is deleted', async () => {
      const req = { user: { userId: 1 } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.deleteService(10, req, res);

      expect(servicesService.deleteService).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Service deleted successfully',
      });
    });

    it('should return 403 when unauthorized to delete', async () => {
      const req = { user: { userId: 2 } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockServicesService.deleteService = jest.fn().mockResolvedValue(false);

      await controller.deleteService(11, req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized to delete this service',
      });
    });
  });

  describe('findByCategory', () => {
    it('should return services by category name', async () => {
      const mockDtos: ServiceResponseDto[] = [
        {
          id: 1,
          name: 'Producto',
          description: 'Fotos de producto',
          price: 90,
          categoryName: 'Producto',
          minimum_minutes: 60,
        },
      ];

      mockServicesService.getServicesByCategoryName = jest
        .fn()
        .mockResolvedValue(mockDtos);

      const result = await controller.findByCategory('producto');
      expect(result).toEqual(mockDtos);
      expect(servicesService.getServicesByCategoryName).toHaveBeenCalledWith(
        'producto',
      );
    });
  });
});
