import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { Repository } from 'typeorm';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';

import { RatingUserResponseDto } from './dto/rating-user-response.dto';
import { RatingHistoryResponseDto } from './dto/rating-history-response.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async createRating(
    dto: CreateRatingDto,
    clientId: number,
  ): Promise<RatingResponseDto> {
    const client = await this.userRepo.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    const service = await this.serviceRepo.findOne({
      where: { id: dto.serviceId },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    const existing = await this.ratingRepo.findOne({
      where: {
        service: { id: dto.serviceId },
        client: { id: clientId },
      },
    });

    if (existing) {
      throw new ConflictException('Ya has calificado este servicio');
    }

    const rating = this.ratingRepo.create({
      service,
      client,
      rating: dto.ratingValue,
      comment: dto.comment,
    });

    const saved = await this.ratingRepo.save(rating);

    return {
      id: saved.id,
      serviceId: saved.service.id,
      clientId: saved.client.id,
      rating: saved.rating,
      comment: saved.comment,
    };
  }

  async getFormattedRatings(
    serviceId: number,
  ): Promise<RatingUserResponseDto[]> {
    const ratings = await this.ratingRepo.find({
      where: { service: { id: serviceId } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });

    return ratings.map((r) => ({
      nombre: r.client.name || 'Usuario',
      fecha: r.createdAt.toLocaleDateString('es-ES'),
      puntuacion: r.rating,
      comentario: r.comment ?? '',
      avatarUrl:
        r.client.url_profile_image ??
        'https://cdn.cosmos.so/default-avatar.jpg',
    }));
  }

  async getUserRatings(clientId: number): Promise<RatingHistoryResponseDto[]> {
    const ratings = await this.ratingRepo.find({
      where: { client: { id: clientId } },
      relations: ['service', 'service.photographer'],
      order: { createdAt: 'DESC' },
    });

    return ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? '',
      fecha: r.createdAt.toLocaleDateString('es-ES'),
      serviceName: r.service.name,
      photographerName: r.service.photographer.name,
      photographerId: r.service.photographer.id,
      photographerAvatar:
        r.service.photographer.url_profile_image ??
        'https://cdn.cosmos.so/default-avatar.jpg',
    }));
  }
}
