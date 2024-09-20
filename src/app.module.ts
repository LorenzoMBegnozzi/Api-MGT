import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager'; // Importando o CacheModule
import { ScryfallService } from './services/scryfall/scryfall.service';
import { ScryfallController } from './scryfall/scryfall.controller';
import { CardSchema } from './schemas/card.schema';
import { DeckSchema } from './schemas/deck.schema';
import { AuthModule } from './auth/auth.module'; 
import { UsersModule } from './users/users.module';
import { DeckModule } from './deck/deck.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot('mongodb://localhost/Api-Magic'),
    MongooseModule.forFeature([
      { name: 'Card', schema: CardSchema },
      { name: 'Deck', schema: DeckSchema },
    ]),
    CacheModule.register({
      isGlobal: true, 
    }),
    AuthModule, 
    UsersModule, 
    DeckModule,
  ],
  controllers: [ScryfallController],
  providers: [ScryfallService],
})
export class AppModule {}
