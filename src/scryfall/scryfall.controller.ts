import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ScryfallService } from '../services/scryfall/scryfall.service';

@Controller('scryfall')
export class ScryfallController {
  constructor(private readonly scryfallService: ScryfallService) { }

  @Get('search')
  async searchCard(@Query('q') query: string) {
    try {
      const response = await this.scryfallService.searchCard(query);
      return response;
    } catch (error) {
      console.error('Erro ao buscar carta:', error); // Log para depuração
      throw new HttpException('Erro ao buscar carta', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('commander')
  async getCommander() {
    try {
      const query = 'type:legendary+type:creature'; // Busca por criaturas lendárias
      const response = await this.scryfallService.searchCard(query);
      return response;
    } catch (error) {
      console.error('Erro ao buscar comandante:', error); // Log para depuração
      throw new HttpException('Erro ao buscar comandante', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('deck')
  async getDeck(@Query('commanderId') commanderId: string) {
    try {
      // Buscar o comandante pelo ID fornecido
      const commander = await this.scryfallService.getCardById(commanderId);
      if (!commander || !commander.colors) {
        throw new HttpException('Comandante não encontrado ou dados inválidos', HttpStatus.NOT_FOUND);
      }

      // Obter as cores do comandante e buscar cartas compatíveis
      const colors = commander.colors.join(',');
      const deckResponse = await this.scryfallService.searchCard(`color:${colors}`);

      // Verifique se a resposta possui um array de cartas na propriedade `data`
      if (!deckResponse || !deckResponse.data || !Array.isArray(deckResponse.data)) {
        throw new HttpException('Erro ao buscar cartas para o deck', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Filtrar o deck obtido para garantir conformidade com as regras do Commander
      const filteredDeck = this.filterDeck(deckResponse.data);

      // Salvar o deck em um arquivo JSON
      await this.scryfallService.saveDeckToFile(filteredDeck);

      // Salvar o deck no MongoDB
      const savedDeck = await this.scryfallService.saveDeckToDatabase(filteredDeck);

      return savedDeck;
    } catch (error) {
      console.error('Erro interno do servidor:', error.message); // Log para depuração
      throw new HttpException('Erro interno do servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private filterDeck(cards: any[]): any[] {
    if (!Array.isArray(cards)) {
      throw new Error('Esperado um array de cartas');
    }

    const deck = [];
    const basicLands = new Set(['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']);

    for (const card of cards) {
      if (deck.length >= 99) break;

      const isBasicLand = basicLands.has(card.name);

      if (isBasicLand || !deck.find(c => c.name === card.name)) {
        deck.push(card);
      }
    }

    return deck;
  }
}
