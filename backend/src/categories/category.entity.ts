import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Service } from '../services/service.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'ID único de la categoría' })
  id: number;

  @Column()
  @ApiProperty({ example: 'Boda', description: 'Nombre de la categoría' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({
    example: 'Servicios relacionados con fotografía de bodas',
    description: 'Descripción opcional de la categoría',
    required: false,
  })
  description: string;

  @OneToMany(() => Service, (service) => service.category, { cascade: true })
  @ApiProperty({
    type: () => [Service],
    description: 'Servicios asociados a esta categoría',
    required: false,
  })
  services: Service[];
}
