import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Service } from '../services/service.entity'; // entidad de servicios
import { PhotographerPublicDto } from './dto/photographer-public.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UpdatePhotographerProfileDto } from './dto/update-photographer-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,

    private jwtService: JwtService,
  ) {}

  async getServicesByPhotographerId(
    photographerId: number,
  ): Promise<Service[]> {
    return this.serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.photographer', 'photographer')
      .leftJoinAndSelect('service.category', 'category') // si usas category
      .where('photographer.id = :photographerId', { photographerId })
      .getMany();
  }

  async signup(
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    role: UserRole,
  ): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = this.userRepo.create({
      name,
      email,
      password_hash: hash,
      phone_number: phoneNumber,
      role,
      active: true,
      registry_date: new Date(),
    });

    return this.userRepo.save(newUser);
  }

  async updateProfileImage(userId: number, imageUrl: string): Promise<void> {
    await this.userRepo.update(userId, { url_profile_image: imageUrl });
  }

  async updateCoverImage(userId: number, imageUrl: string): Promise<void> {
    await this.userRepo.update(userId, { url_cover_image: imageUrl });
  }

  async setPortfolioUrlIfMissing(
    userId: number,
    portfolioUrl: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.url_portfolio) {
      user.url_portfolio = portfolioUrl;
      await this.userRepo.save(user);
    }
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.jwtService.sign({
      email: user.email,
      role: user.role,
      sub: user.id,
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async getTop10PhotographersByBookings(): Promise<any[]> {
    return this.userRepo.query(`
        SELECT u.id AS photographer_id,
        u.name AS photographer_name,
        COUNT(b.id) AS booking_count
        FROM users u
        JOIN service s ON u.id = s.photographer_id
        JOIN booking b ON s.id = b.service_id
        WHERE u.role = 'PHOTOGRAPHER'
        GROUP BY u.id, u.name
        ORDER BY booking_count DESC
        LIMIT 10;
      `);
  }

  // async getPhotographersByCategory(categoryId: number): Promise<PhotographerCardResponseDto[]> {
  //   const photographers = await this.userRepo.find({
  //     where: {
  //       role: UserRole.PHOTOGRAPHER,
  //       services: {
  //         category: { id: categoryId },
  //       },
  //     },
  //     relations: ['services', 'services.category', 'services.ratings'],
  //   });

  //   return photographers.map((user) => {
  //     const service = user.services[0]; // Usamos el primero como "principal"

  //     const ratings = service?.ratings ?? [];
  //     const avg =
  //       ratings.length > 0
  //         ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
  //         : 0;

  //     return {
  //       id: String(user.id),
  //       nombreEstudio: service?.name ?? user.name,
  //       fotografiaUrl: user.url_profile_image ?? '',
  //       // fotoPortada: service?.coverPhotoUrl ?? '', //implementaremos portada mas adelante
  //       puntuacion: parseFloat(avg.toFixed(1)),
  //       categoriaId: service?.category?.id ?? null,
  //       direccion: user?.location ?? '',
  //       seguidores: user.followersCount ?? 0,
  //       verificado: user.isVerified ?? false,
  //     };
  //   });
  // }

  async getAllPhotographers(): Promise<PhotographerPublicDto[]> {
    const photographers = await this.userRepo.find({
      where: { role: UserRole.PHOTOGRAPHER },
      relations: {
        services: {
          ratings: true,
        },
        locations: true,
        availability: {
          day: true,
          schedule: true,
        },
      },
    });

    return photographers.map((user) => {
      const allRatings = user.services.flatMap((s) => s.ratings ?? []);
      const sum = allRatings.reduce((acc, r) => acc + (r.rating || 0), 0);
      const average = allRatings.length > 0 ? sum / allRatings.length : 0;

      const week = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        slots: [],
      }));

      user.availability?.forEach((slot) => {
        const dayIndex = slot.day.id - 1;
        week[dayIndex].slots.push({
          start: slot.schedule.starting_hour,
          end: slot.schedule.ending_hour,
        });
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        registry_date: user.registry_date,
        active: user.active,
        role: user.role,
        description: user.description,
        url_portfolio: user.url_portfolio,
        url_profile_image: user.url_profile_image,
        services: user.services,
        locations: user.locations,
        averageRating: parseFloat(average.toFixed(2)),
        availability: week,
      };
    });
  }

  async updateClientProfile(
    userId: number,
    dto: UpdateClientProfileDto,
  ): Promise<void> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('Usuario no encontrado');

    if (dto.name) user.name = dto.name;
    if (dto.password) user.password_hash = await bcrypt.hash(dto.password, 10);
    if (dto.phone_number) user.phone_number = dto.phone_number;

    await this.userRepo.save(user);
  }


  async updatePhotographerProfile(
    userId: number,
    dto: UpdatePhotographerProfileDto,
  ): Promise<void> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('Usuario no encontrado');

    if (dto.name) user.name = dto.name;
    if (dto.password) user.password_hash = await bcrypt.hash(dto.password, 10);
    if (dto.phone_number) user.phone_number = dto.phone_number;
    if (dto.description) user.description = dto.description;

    await this.userRepo.save(user);
  }


  async getPhotographerProfileById(userId: number): Promise<PhotographerPublicDto> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        role: UserRole.PHOTOGRAPHER,
      },
      relations: {
        services: {
          ratings: true,
        },
        locations: true,
        availability: {
          day: true,
          schedule: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Fotógrafo no encontrado o no autorizado');
    }

    const allRatings = user.services.flatMap((s) => s.ratings ?? []);
    const sum = allRatings.reduce((acc, r) => acc + (r.rating || 0), 0);
    const average = allRatings.length > 0 ? sum / allRatings.length : 0;

    const week = Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      slots: [],
    }));

    user.availability?.forEach((slot) => {
      const dayIndex = slot.day.id - 1;
      week[dayIndex].slots.push({
        start: slot.schedule.starting_hour,
        end: slot.schedule.ending_hour,
      });
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      registry_date: user.registry_date,
      active: user.active,
      role: user.role,
      description: user.description,
      url_portfolio: user.url_portfolio,
      url_profile_image: user.url_profile_image,
      services: user.services,
      locations: user.locations,
      averageRating: parseFloat(average.toFixed(2)),
      availability: week,
    };
  }


}
