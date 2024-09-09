import { Controller, Post, Body } from '@nestjs/common';
import { DeckService } from './deck.service';

@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post('create')
  async createDeck(@Body('commanderName') commanderName: string) {
    try {
      const deck = await this.deckService.createDeck(commanderName);
      return deck;
    } catch (error) {
      throw new Error(`Erro ao criar o deck: ${error.message}`);
    }
  }
}
