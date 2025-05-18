import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`🟢 Usuario ${userId} conectado al canal de notificaciones`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.leave(`user_${userId}`);
      console.log(`🔴 Usuario ${userId} desconectado`);
    }
  }

  sendNotification(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
  }
}
