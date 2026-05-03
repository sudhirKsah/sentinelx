import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) {
        throw new Error('No token provided');
      }

      const secret = this.configService.get<string>('JWT_SECRET') || 'dev-secret-key-change-in-prod';
      const payload = this.jwtService.verify(token as string, { secret });
      
      const orgId = payload.org_id;
      // Join a room specific to the user's organization
      client.join(`org_${orgId}`);
      this.logger.log(`Client connected: ${client.id} to org_${orgId}`);
    } catch (err: any) {
      this.logger.error(`WebSocket authentication failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastEvent(orgId: string, event: any) {
    this.server.to(`org_${orgId}`).emit('real-time:event', event);
  }

  broadcastAlert(orgId: string, alert: any) {
    this.server.to(`org_${orgId}`).emit('real-time:alert', alert);
  }
}
