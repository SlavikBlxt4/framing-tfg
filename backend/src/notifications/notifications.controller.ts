import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getMyNotifications(@Req() req) {
    const userId = req.user.userId;
    console.log('userId', userId);
    return this.notificationsService.getUserNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      throw new NotFoundException('ID inválido');
    }
    await this.notificationsService.markAsRead(notificationId);
    return { status: 'ok' };
  }
}
