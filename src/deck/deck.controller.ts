import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { DeckService } from './deck.service';

@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post('create')
  async createDeck(@Body('commanderName') commanderName: string, @Body('userId') userId: string) {
    try {
      const deck = await this.deckService.createDeck(commanderName, userId);
      return deck;
    } catch (error) {
      throw new Error(`Erro ao criar o deck: ${error.message}`);
    }
  }

  @Get()
  async getDecksByUserId(@Query('userId') userId: string) {
    try {
      const decks = await this.deckService.getDecksByUserId(userId);
      return decks;
    } catch (error) {
      throw new Error(`Erro ao buscar decks: ${error.message}`);
    }
  }
}
