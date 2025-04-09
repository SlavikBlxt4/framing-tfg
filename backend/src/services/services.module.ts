import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { User } from '../users/user.entity';
// import { Style } from '../styles/style.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, User]), // añadir style luego
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
