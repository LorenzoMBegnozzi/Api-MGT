import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { DeckSchema } from './deck.schema';
import { CardSchema } from './schemas/card.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Deck', schema: DeckSchema },
      { name: 'Card', schema: CardSchema },
    ]),
    HttpModule,
  ],
  providers: [DeckService],
  controllers: [DeckController],
  exports: [MongooseModule],
})
export class DeckModule { }
