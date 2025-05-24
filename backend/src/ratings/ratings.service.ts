import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { Repository } from 'typeorm';

import { RatingUserResponseDto } from './dto/rating-user-response.dto';
import { RatingHistoryResponseDto } from './dto/rating-history-response.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
  ) {}

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

  async getRatingsByPhotographer(
    photographerId: number,
  ): Promise<RatingUserResponseDto[]> {
    const ratings = await this.ratingRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.client', 'c')
      .leftJoinAndSelect('r.service', 's')
      .where('s.photographer_id = :photographerId', { photographerId })
      .orderBy('r.created_at', 'DESC')
      .getMany();

    return ratings.map((r) => ({
      nombre: r.client?.name || 'Usuario',
      fecha: r.createdAt.toLocaleDateString('es-ES'),
      puntuacion: r.rating,
      comentario: r.comment ?? '',
      avatarUrl:
        r.client?.url_profile_image ??
        'https://cdn.cosmos.so/default-avatar.jpg',
    }));
  }

}
