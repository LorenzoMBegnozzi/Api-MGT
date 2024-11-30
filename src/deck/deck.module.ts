import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { DeckSchema } from './deck.schema';
import { CardSchema } from './schemas/card.schema';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQModule, RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { DeckWorker } from './deck.worker';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Deck', schema: DeckSchema },
      { name: 'Card', schema: CardSchema },
    ]),
    HttpModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: () => ({
        uri: 'amqp://localhost', // URL do seu RabbitMQ
        exchanges: [
          {
            name: 'deck_exchange',
            type: 'direct', // Ou 'topic', dependendo do que você precisa
          },
        ],
        queues: [
          {
            name: 'deck_queue',
            options: {
              durable: true, // Ou false, dependendo das suas necessidades
            },
          },
        ],
        bindings: [
          {
            exchange: 'deck_exchange',
            target: 'deck_queue',
            routingKey: 'deck_routing_key', // A chave de roteamento
          },
        ],
      }),
    }),
  ],
  providers: [DeckService, DeckWorker],
  controllers: [DeckController],
  exports: [MongooseModule],
})
export class DeckModule {}
