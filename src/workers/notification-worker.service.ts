import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class NotificationWorkerService implements OnModuleInit {
  private server: Server;

  onModuleInit() {
    this.server = new Server(3001, { cors: { origin: '*' } });
    console.log('Servidor WebSocket iniciado na porta 3001');
  }

  notifyUpdate(deckUpdate: any) {
    this.server.emit('deck_updated', deckUpdate);
  }
}
