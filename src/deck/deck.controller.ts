import { Controller, Post, Body } from '@nestjs/common';
import { DeckService } from './deck.service';

@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post('create')
  async createDeck(@Body('commanderName') commanderName: string) {
    try {
      return this.deckService.createDeck(commanderName);
    }   catch {
      throw new Error ("Errouuu")
    }
  }
}
