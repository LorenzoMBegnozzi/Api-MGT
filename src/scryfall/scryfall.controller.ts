import { Controller, Get, Post, Body, Query, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ScryfallService } from '../services/scryfall/scryfall.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('scryfall')
export class ScryfallController {
  constructor(private readonly scryfallService: ScryfallService) { }

   @UseGuards(JwtAuthGuard)
  @Post('deck')
  async createDeck(@Body('commanderId') commanderId: string, @Req() req) {
    try {

      const userId = req.user.userId;

      // commander por id 
      const commander = await this.scryfallService.getCardById(commanderId);
      if (!commander || !commander.colors) {
        throw new HttpException('Comandante não encontrado ou dados inválidos', HttpStatus.NOT_FOUND);
      }

      // deck pelas cores
      const deck = await this.scryfallService.getDeckByCommander(commander.name);

      // add comander ao deck
      deck.push({
        name: commander.name,
        type: commander.type_line,
        manaCost: commander.mana_cost,
        colors: commander.colors,
        imageUrl: commander.image_uris?.normal || null,
      });

      // salvar deck no json
      await this.scryfallService.saveDeckToFile(deck);

      // salcar deck mongo
      const savedDeck = await this.scryfallService.saveDeckToDatabase(deck, userId, commander.name);

      return savedDeck;
    } catch (error) {
      console.error('Erro interno do servidor:', error.message); 
      throw new HttpException('Erro interno do servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search')
  async searchCard(@Query('q') query: string, @Query('page') page: number = 1) {
    try {
      const response = await this.scryfallService.searchCard(query, page);
      return response;
    } catch (error) {
      console.error('Erro ao buscar carta:', error); 
      throw new HttpException('Erro ao buscar carta', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('commander')
  async getCommander(@Query('page') page: number = 1) {
    try {
      const query = 'type:legendary+type:creature'; 
      const response = await this.scryfallService.searchCard(query, page);
      return response;
    } catch (error) {
      console.error('Erro ao buscar comandante:', error); // Log para depuração
      throw new HttpException('Erro ao buscar comandante', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('deck')
  async getDeck(@Query('commanderId') commanderId: string) {
    try {
      const commander = await this.scryfallService.getCardById(commanderId);
      if (!commander || !commander.colors) {
        throw new HttpException('Comandante não encontrado ou dados inválidos', HttpStatus.NOT_FOUND);
      }

      const deck = await this.scryfallService.getDeckByCommander(commander.name);

      return deck;
    } catch (error) {
      console.error('Erro interno do servidor:', error.message); // Log para depuração
      throw new HttpException('Erro interno do servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
