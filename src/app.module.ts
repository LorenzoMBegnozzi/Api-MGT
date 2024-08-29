import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Importando corretamente o HttpModule
import { MongooseModule } from '@nestjs/mongoose';
import { ScryfallService } from './services/scryfall/scryfall.service';
import { ScryfallController } from './scryfall/scryfall.controller';
import { CardSchema } from './schemas/card.schema';

@Module({
  imports: [
    HttpModule, 
    MongooseModule.forRoot('mongodb://localhost/Api-Magic'),
    MongooseModule.forFeature([{ name: 'Card', schema: CardSchema }]),
  ],
  controllers: [ScryfallController],
  providers: [ScryfallService],
})
export class AppModule {}
