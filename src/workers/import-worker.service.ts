import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class ImportWorkerService implements OnModuleInit {
  private client: ClientProxy;

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'deck_import_queue',
        queueOptions: { durable: true },
      },
    });

    this.client.connect().then(() => {
      console.log('Worker de importação conectado ao RabbitMQ!');
      this.listenForMessages();
    });
  }

  private listenForMessages() {
    this.client.subscribeToResponseOf('deck_import');
    this.client.send('deck_import', {}).subscribe((deck) => {
      console.log('Processando deck:', deck);
      // Lógica de processamento
    });
  }
}
