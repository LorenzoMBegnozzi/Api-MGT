import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ScryfallModule } from './auth/decorators/scryfall.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DeckModule } from './deck/deck.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    ScryfallModule,
    HttpModule,
    MongooseModule.forRoot('mongodb://localhost/Api-Magic'),
    CacheModule.register({
      ttl: 300,
      max: 100,
      isGlobal: true,
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        { name: 'deck_exchange', type: 'direct' },
      ],
      uri: 'amqp://localhost', // Altere para a URI do RabbitMQ se necessário
    }),
    AuthModule,
    UsersModule,
    DeckModule,
  ],
})
export class AppModule {}
