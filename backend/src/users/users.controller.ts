import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request } from 'express';
import { ServiceResponseDto } from '../services/dto/service-response.dto';
import { UserRole } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() body: Partial<User>): Promise<User> {
    return this.usersService.signup(
      body.name,
      body.email,
      body.password_hash,
      body.phone_number,
      body.role as UserRole,
    );
  }
  @Get('hello')
  async helloWorld(): Promise<string> {
    return 'Hello, world!';
  }

  @Post('login')
  async login(@Body() body: Partial<User>): Promise<string> {
    return this.usersService.login(body.email, body.password_hash);
  }

  @UseGuards(JwtAuthGuard)
  @Get('services')
  async getMyServices(@Req() req: Request): Promise<ServiceResponseDto[]> {
    const userId = req.user['userId'];
    const role = req.user['role'];
    console.log('User ID:', userId);
    console.log('User Role:', role);
    console.log('Request User:', req.user);

    if (role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException(
        'Solo los fotógrafos pueden ver sus servicios.',
      );
    }

    const services =
      await this.usersService.getServicesByPhotographerId(userId);

    return services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      imageUrl: s.imageUrl,
      categoryName: s.category?.name,
    }));
  }

  @Get('top-photographers')
  async getTop10Photographers() {
    return this.usersService.getTop10PhotographersByBookings();
  }
}
