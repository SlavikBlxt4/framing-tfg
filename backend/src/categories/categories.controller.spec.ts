import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: jest.Mocked<CategoriesService>;

  const mockCategories: Category[] = [
    { id: 1, name: 'Retrato', description: 'Fotos retrato', services: [] },
    { id: 2, name: 'Producto', description: 'Fotos producto', services: [] },
  ];

  const mockService: Partial<jest.Mocked<CategoriesService>> = {
    getAllCategories: jest.fn().mockResolvedValue(mockCategories),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all categories', async () => {
    const result = await controller.getAll();
    expect(result).toEqual(mockCategories);
    expect(categoriesService.getAllCategories).toHaveBeenCalled();
  });
});
