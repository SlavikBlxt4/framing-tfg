import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { User, UserRole } from './user.entity';
  import * as bcrypt from 'bcrypt';
  import { JwtService } from '@nestjs/jwt';
//   import { Service } from '../services/service.entity'; // entidad de servicios
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectRepository(User)
      private userRepo: Repository<User>,
  
    //   @InjectRepository(Service)
    //   private serviceRepo: Repository<Service>,
  
      private jwtService: JwtService,
    ) {}
  
    // async getServicesByPhotographerId(photographer_id: number): Promise<Service[]> {
    //   return this.serviceRepo.find({ where: { photographer: { id: photographer_id } } });
    // }
  
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
      });

  
      return this.userRepo.save(newUser);
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
        SELECT u.*, COUNT(b.id) as total_bookings
        FROM users u
        JOIN bookings b ON u.id = b.photographer_id
        WHERE u.role = 'PHOTOGRAPHER'
        GROUP BY u.id
        ORDER BY total_bookings DESC
        LIMIT 10
      `);
    }
  }
  