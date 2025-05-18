import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationsGateway } from './notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
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

    console.log('[NOTIFICATION] Creando notificación para userId:', userId);

    const saved = await this.notificationRepo.save(notification);

    // ✅ Emitir notificación en tiempo real
    this.notificationsGateway.sendNotification(Number(userId), saved);

    return saved;
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
