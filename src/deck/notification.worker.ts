import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Server } from 'socket.io';

@Injectable()
export class NotificationWorker {
  private io: Server;

  constructor() {
    this.io = new Server(); // Inicialize o Socket.IO conforme sua configuração
  }

  @RabbitSubscribe({
    exchange: 'deck_exchange',
    routingKey: 'deck_updates_queue',
    queue: 'deck_updates_queue',
  })
  async handleDeckUpdate(message: any) {
    const { userId, deckId, status } = message;

    // Emite um evento de notificação para o cliente
    this.io.to(userId).emit('deckUpdate', { deckId, status });
  }
}
