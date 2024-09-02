import { Controller, Post, Body } from '@nestjs/common';
import { DeckService } from './deck.service';

@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post('create')
  async createDeck(@Body('commanderName') commanderName: string) {
    return this.deckService.createDeck(commanderName);
  }
}
