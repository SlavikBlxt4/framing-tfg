import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { User } from '../users/user.entity';
import { Category } from 'src/categories/category.entity';
// import { Category } from '../categories/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, User, Category])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
