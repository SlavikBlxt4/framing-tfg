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
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ServiceResponseDto } from '../services/dto/service-response.dto';
import { UserRole } from './user.entity';
import { TokenResponseDto } from './dto/token-response.dto';
import { TopPhotographerDto } from './dto/top-photographer.dto';
import { PhotographerPublicDto } from './dto/photographer-public.dto';


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado',
    type: UserResponseDto,
  })
  async signup(@Body() body: SignupDto): Promise<UserResponseDto> {
    return this.usersService.signup(
      body.name,
      body.email,
      body.password,
      body.phone_number,
      body.role,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'JWT devuelto',
    type: TokenResponseDto,
  })
  async login(@Body() body: LoginDto): Promise<string> {
    return this.usersService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('services')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver servicios del fotógrafo autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Servicios encontrados',
    type: [ServiceResponseDto],
  })
  async getMyServices(@Req() req: Request): Promise<ServiceResponseDto[]> {
    const userId = req.user['userId'];
    const role = req.user['role'];

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
      minimum_minutes: s.minimum_minutes,
    }));
  }

  @Get('top-photographers')
  @ApiOperation({ summary: 'Obtener top 10 fotógrafos por reservas' })
  @ApiResponse({ status: 200, type: [TopPhotographerDto] })
  async getTop10Photographers() {
    return this.usersService.getTop10PhotographersByBookings();
  }


  // PARA DEVOLVER TODA LA INFO DE TODOS LOS FOTÓGRAFOS
  @Get('photographers')
  @ApiOperation({ summary: 'Obtener todos los fotógrafos con su rating promedio' })
  async getAllPhotographers(): Promise<PhotographerPublicDto[]> {
    return this.usersService.getAllPhotographers();
  }


}
