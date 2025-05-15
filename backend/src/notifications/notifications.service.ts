import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    title: string,
    message: string,
    type: string = 'SESSION_UPDATED',
  ) {
    const notification = this.notificationRepo.create({
      user: { id: Number(userId) },
      title,
      message,
      type,
    });
    return this.notificationRepo.save(notification);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { user: { id: Number(userId) } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.notificationRepo.update(notificationId, { read: true });
  }
}
