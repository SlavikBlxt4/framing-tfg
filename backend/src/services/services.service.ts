import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { User, UserRole } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { TopRatedServiceDto } from './dto/top-rated-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async createService(
    dto: CreateServiceDto,
    photographerId: number,
  ): Promise<Service> {
    const photographer = await this.userRepo.findOne({
      where: { id: photographerId },
    });
    if (!photographer) {
      throw new NotFoundException('Photographer not found');
    }

    if (photographer.role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException('User is not a photographer');
    }

    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const service = this.serviceRepo.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      photographer,
      category,
      minimum_minutes: dto.minimum_minutes,
    });

    return this.serviceRepo.save(service);
  }

  async getTop10HighestRatedServices(): Promise<TopRatedServiceDto[]> {
    return this.serviceRepo.query(`
      SELECT s.id, s.name, s.price, AVG(r.rating) AS avg_rating
      FROM service s
      JOIN rating r ON s.id = r.service_id
      GROUP BY s.id
      ORDER BY avg_rating DESC
      LIMIT 10
    `);
  }

  async deleteService(
    serviceId: number,
    photographerId: number,
  ): Promise<boolean> {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
      relations: ['photographer'],
    });

    if (!service) return false;

    if (service.photographer.id !== photographerId) {
      return false;
    }

    await this.serviceRepo.remove(service);
    return true;
  }

  async findServiceById(id: number): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id },
      relations: ['category', 'photographer'],
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async getServicesByCategoryName(
    categoryName: string,
  ): Promise<ServiceResponseDto[]> {
    const services = await this.serviceRepo
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.category', 'category')
      .where('LOWER(category.name) = LOWER(:categoryName)', { categoryName })
      .leftJoinAndSelect('s.photographer', 'photographer')
      .getMany();

    return services.map(this.convertToDto);
  }

  private convertToDto(service: Service): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      imageUrl: service.imageUrl,
      categoryName: service.category?.name,
      minimum_minutes: service.minimum_minutes,
      discount: service.discount,
    };
  }

  async editService(
    serviceId: number,
    photographerId: number,
    dto: Partial<CreateServiceDto>,
  ): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
      relations: ['photographer', 'category'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.photographer.id !== photographerId) {
      throw new ForbiddenException('You are not allowed to edit this service');
    }

    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      service.category = category;
    }

    if (dto.name !== undefined) service.name = dto.name;
    if (dto.description !== undefined) service.description = dto.description;
    if (dto.price !== undefined) service.price = dto.price;
    if (dto.minimum_minutes !== undefined)
      service.minimum_minutes = dto.minimum_minutes;

    return this.serviceRepo.save(service);
  }
}
