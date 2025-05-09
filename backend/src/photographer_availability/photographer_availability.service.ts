import { Injectable } from '@nestjs/common';
import { CreatePhotographerAvailabilityDto } from './dto/create-photographer_availability.dto';
import { UpdatePhotographerAvailabilityDto } from './dto/update-photographer_availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotographerAvailability } from './entities/photographer_availability.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { BadRequestException } from '@nestjs/common';


@Injectable()
export class PhotographerAvailabilityService {
  constructor(
    @InjectRepository(PhotographerAvailability)
    private readonly availabilityRepo: Repository<PhotographerAvailability>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}


  // CREAR Y MODIFICAR EL HORARIO DE UN FOTÓGRAFO UN DIA EN CONCRETO (DE LA SEMANA)
  async create(dto: CreatePhotographerAvailabilityDto, photographerId: number) {
      const { day, slots } = dto;

      // 1. Eliminar disponibilidad existente
      await this.availabilityRepo.delete({ photographerId, dayId: day });

      // 2. Por cada slot, buscar el id de la franja en la tabla schedule
      const inserts: PhotographerAvailability[] = [];

      for (const slot of slots) {
        const schedule = await this.scheduleRepo.findOne({
          where: {
            starting_hour: slot.start,
            ending_hour: slot.end,
          },
        });

        if (!schedule) {
          throw new BadRequestException(
            `No existe una franja para ${slot.start} - ${slot.end}`,
          );
        }

        inserts.push(
          this.availabilityRepo.create({
            photographerId,
            dayId: day,
            scheduleId: schedule.id,
          }),
        );
      }

      // 3. Guardar todas las nuevas franjas
      await this.availabilityRepo.save(inserts);

      return { message: 'Disponibilidad actualizada correctamente' };
    }


    // RECUPERAR TODO EL HORARIO DE UN FOTÓGRAFO DE TODOS LOS DIAS DE LA SEMANA
    async findAllForPhotographer(photographerId: number) {
      // 1. Obtener toda la disponibilidad del fotógrafo con join al schedule
      const all = await this.availabilityRepo.find({
        where: { photographerId },
        relations: ['schedule'],
      });

      // 2. Agrupar por día
      const grouped: Record<number, { start: string; end: string }[]> = {};

      for (const entry of all) {
        if (!grouped[entry.dayId]) {
          grouped[entry.dayId] = [];
        }

        grouped[entry.dayId].push({
          start: (entry as any).schedule?.starting_hour,
          end: (entry as any).schedule?.ending_hour,
        });
      }

      // 3. Devolver días 1–7 aunque no tengan slots
      const result = Array.from({ length: 7 }, (_, i) => {
        const day = i + 1;
        return {
          day,
          slots: grouped[day] || [],
        };
      });

      return result;
    }



  


  findAll() {
    return `This action returns all photographerAvailability`;
  }

  findOne(id: number) {
    return `This action returns a #${id} photographerAvailability`;
  }

  remove(id: number) {
    return `This action removes a #${id} photographerAvailability`;
  }
}
