import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ScryfallModule } from './auth/decorators/scryfall.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DeckModule } from './deck/deck.module';

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
    AuthModule,
    UsersModule,
    DeckModule,
  ],
})
export class AppModule {}
