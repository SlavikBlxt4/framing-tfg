import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { S3Service } from 'src/s3/s3.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from './dto/file-upload.dto';
import { BookingsService } from 'src/bookings/bookings.service';
import { Patch } from '@nestjs/common';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UpdatePhotographerProfileDto } from './dto/update-photographer-profile.dto';



@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
    private readonly bookingService: BookingsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiOperation({
    summary: 'Sube una imagen de perfil para el usuario CLIENTE',
  })
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== UserRole.CLIENT) {
      throw new ForbiddenException(
        'Solo los clientes pueden subir esta imagen de perfil.',
      );
    }

    const imageUrl = await this.s3Service.uploadUserProfileImage(userId, file);
    await this.usersService.updateProfileImage(userId, imageUrl);
    return { imageUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('photographers/upload-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiOperation({ summary: 'Sube imagen de perfil como fotógrafo' })
  async uploadPhotographerProfile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException(
        'Solo los fotógrafos pueden subir su imagen de perfil.',
      );
    }

    const imageUrl = await this.s3Service.uploadToPath(
      `photographers/${userId}/perfil/foto.jpg`,
      file,
    );

    await this.usersService.updateProfileImage(userId, imageUrl);
    return { imageUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('photographers/upload-cover-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiOperation({ summary: 'Sube imagen de portada del fotógrafo' })
  async uploadPhotographerCover(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException(
        'Solo los fotógrafos pueden subir su portada.',
      );
    }

    const imageUrl = await this.s3Service.uploadToPath(
      `photographers/${userId}/portada/portada.jpg`,
      file,
    );

    await this.usersService.updateCoverImage(userId, imageUrl);
    return { imageUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('photographers/upload-portfolio-images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Sube varias imágenes al portfolio del fotógrafo' })
  async uploadPortfolioImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException(
        'Solo los fotógrafos pueden subir su portfolio.',
      );
    }

    const uploaded: string[] = [];

    for (const file of files) {
      const key = `photographers/${userId}/portfolio/portfolio_${Date.now()}_${file.originalname}`;
      const url = await this.s3Service.uploadToPath(key, file);
      uploaded.push(url);
    }

    const baseUrl = this.s3Service.getPublicBaseUrl(
      `photographers/${userId}/portfolio/`,
    );
    await this.usersService.setPortfolioUrlIfMissing(userId, baseUrl);

    return { uploaded };
  }

  @Get('photographers/:id/portfolio')
  @ApiOperation({
    summary: 'Obtener las imágenes del portfolio de un fotógrafo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de URLs públicas del portfolio',
  })
  async getPhotographerPortfolio(@Param('id') photographerId: string) {
    const prefix = `photographers/${photographerId}/portfolio/`;
    const images = await this.s3Service.listPublicUrlsInPrefix(prefix);
    return { images };
  }

  @UseGuards(JwtAuthGuard)
  @Post('photographers/upload-session-images/:bookingId')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Sube imágenes privadas de una sesión' })
  async uploadSessionImages(
    @Param('bookingId') bookingId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException(
        'Solo los fotógrafos pueden subir imágenes de sesión.',
      );
    }

    // Verifica que el booking le pertenezca
    const booking = await this.bookingService.findById(Number(bookingId));
    if (!booking || booking.service.photographer.id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para subir imágenes a esta sesión.',
      );
    }

    const uploaded: string[] = [];

    for (const file of files) {
      const key = `photographers/${userId}/sesiones/${bookingId}/${Date.now()}_${file.originalname}`;
      const url = await this.s3Service.uploadToPath(key, file);
      uploaded.push(url);
    }

    // Solo guardar url_images si está vacío
    const sessionPath = this.s3Service.getPublicBaseUrl(
      `photographers/${userId}/sesiones/${bookingId}/`,
    );
    await this.bookingService.setUrlImagesIfMissing(
      Number(bookingId),
      sessionPath,
    );

    return { uploaded };
  }

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
  @ApiOperation({
    summary: 'Obtener todos los fotógrafos con su rating promedio',
  })
  async getAllPhotographers(): Promise<PhotographerPublicDto[]> {
    return this.usersService.getAllPhotographers();
  }


  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del cliente autenticado' })
  @ApiBody({ type: UpdateClientProfileDto })
  async updateClientProfile(
    @Req() req: any,
    @Body() updateDto: UpdateClientProfileDto,
  ) {
    const userId = req.user.userId;
    await this.usersService.updateClientProfile(userId, updateDto);
    return { message: 'Perfil actualizado correctamente' };
  }

  
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener datos públicos de un usuario por ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(Number(id));
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      active: user.active,
      url_profile_image: user.url_profile_image,
    };
  }


  @UseGuards(JwtAuthGuard)
  @Get('me/photographer-profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil completo del fotógrafo logueado' })
  async getMyPhotographerProfile(@Req() req: Request): Promise<PhotographerPublicDto> {
    const userId = req.user['userId']; // id del token JWT
    return this.usersService.getPhotographerProfileById(userId);
  }


  @UseGuards(JwtAuthGuard)
  @Patch('photographers/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del fotógrafo autenticado' })
  @ApiBody({ type: UpdatePhotographerProfileDto })
  async updatePhotographerProfile(
    @Req() req: any,
    @Body() updateDto: UpdatePhotographerProfileDto,
  ) {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException('Solo los fotógrafos pueden actualizar su perfil.');
    }

    await this.usersService.updatePhotographerProfile(userId, updateDto);
    return { message: 'Perfil actualizado correctamente' };
  }


}
