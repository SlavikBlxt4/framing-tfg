import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías devuelta con éxito',
    type: [Category],
  })
  async getAll(): Promise<Category[]> {
    return this.categoriesService.getAllCategories();
  }
}
