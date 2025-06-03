import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationsGateway } from './notification.gateway';
import { NotificationResponseDto } from './dto/notification-responde.dto';

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
    bookingId?: number,
  ) {
    const notification = this.notificationRepo.create({
      user: { id: Number(userId) },
      title,
      message,
      type,
      booking: bookingId ? { id: bookingId } : undefined,
    });

    console.log('[NOTIFICATION] Creando notificación para userId:', userId);

    const saved = await this.notificationRepo.save(notification);

    // ✅ Emitir notificación en tiempo real
    this.notificationsGateway.sendNotification(Number(userId), saved);

    return saved;
  }

  async createNotificationPhotographer(
    userId: string,
    title: string,
    message: string,
    type: string = 'SESSION_REQUESTED',
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

  // notifications.service.ts
  async getUserNotifications(
    userId: string,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepo.find({
      where: { user: { id: Number(userId) } },
      relations: ['booking'],
      order: { createdAt: 'DESC' },
    });

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      bookingId: n.booking?.id,
      bookingDate: n.booking?.date,
    }));
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.notificationRepo.update(notificationId, { read: true });
  }
}
