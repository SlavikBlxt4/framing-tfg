import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { User, UserRole } from '../users/user.entity';
// import { Style } from '../styles/style.entity';
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

    // @InjectRepository(Style)
    // private readonly styleRepo: Repository<Style>,
  ) {}

//   async createService(dto: CreateServiceDto, photographerId: number): Promise<Service> {
//     const photographer = await this.userRepo.findOne({ where: { id: photographerId } });
//     if (!photographer) {
//       throw new NotFoundException('Photographer not found');
//     }

//     if (photographer.role !== UserRole.PHOTOGRAPHER) {
//       throw new ForbiddenException('User is not a photographer');
//     }

//     const style = await this.styleRepo.findOne({ where: { id: dto.styleId } });
//     if (!style) {
//       throw new NotFoundException('Style not found');
//     }

//     const service = this.serviceRepo.create({
//       name: dto.name,
//       description: dto.description,
//       price: dto.price,
//       imageUrl: dto.imageUrl,
//       availability: dto.availability,
//       photographer,
//       style,
//     });

//     return this.serviceRepo.save(service);
//   }

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

  async deleteService(serviceId: number, photographerId: number): Promise<boolean> {
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
    const service = await this.serviceRepo.findOne({ where: { id }, relations: ['style', 'photographer'] });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async getServicesByStyleName(styleName: string): Promise<ServiceResponseDto[]> {
    const services = await this.serviceRepo
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.style', 'style')
      .where('LOWER(style.name) = LOWER(:styleName)', { styleName })
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
    //   styleName: service.style?.name,
    };
  }
}
