import { Controller, Get, Post, Body, Query, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ScryfallService } from '../services/scryfall/scryfall.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';


@Controller('scryfall')
export class ScryfallController {
  constructor(private readonly scryfallService: ScryfallService) { }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('decks')
  async getDecks(@Req() req) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
      }

      const decks = await this.scryfallService.getDecksByUserId(userId);
      return decks;
    } catch (error) {
      console.error('Erro ao buscar decks:', error.message);
      throw new HttpException('Erro ao buscar decks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('decks/all')
  async getAllDecks(@Req() req) {
    try {
      const decks = await this.scryfallService.getAllDecks();
      return decks;
    } catch (error) {
      console.error('Erro ao buscar todos os baralhos:', error.message);
      throw new HttpException('Erro ao buscar baralhos', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('deck')
  async createDeck(@Body('commanderId') commanderId: string, @Req() req) {
    try {
      console.log('Request User:', req.user);

      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
      }

      //comandante pelo ID
      const commander = await this.scryfallService.getCardById(commanderId);
      if (!commander || !commander.colors) {
        throw new HttpException('Comandante não encontrado ou dados inválidos', HttpStatus.NOT_FOUND);
      }

      // acha deck pelas cores do comandante
      const deck = await this.scryfallService.getDeckByCommander(commander.colors);

      // add o comandante ao deck
      deck.push({
        name: commander.name,
        type: commander.type_line,
        manaCost: commander.mana_cost,
        colors: commander.colors,
        imageUrl: commander.image_uris?.normal || null,
      });

      // salva o deck em arquivo
      await this.scryfallService.saveDeckToFile(deck);

      // salva o deck no db
      console.log('Salvando deck com userId:', userId);
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
      if (!query) {
        throw new HttpException('Query é necessária', HttpStatus.BAD_REQUEST);
      }

      const response = await this.scryfallService.searchCard(query, page);
      return response;
    } catch (error) {
      console.error('Erro ao buscar carta:', error.message);
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
      console.error('Erro ao buscar comandante:', error.message);
      throw new HttpException('Erro ao buscar comandante', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('deck')
  async getDeck(@Query('commanderId') commanderId: string) {
    try {
      if (!commanderId) {
        throw new HttpException('ID do comandante é necessário', HttpStatus.BAD_REQUEST);
      }

      // obtem o comandante pelo id
      const commander = await this.scryfallService.getCardById(commanderId);
      if (!commander || !commander.colors) {
        throw new HttpException('Comandante não encontrado ou dados inválidos', HttpStatus.NOT_FOUND);
      }

      // acha o deck pelas cores do comandante
      const deck = await this.scryfallService.getDeckByCommander(commander.colors);

      return deck;
    } catch (error) {
      console.error('Erro ao buscar deck:', error.message);
      throw new HttpException('Erro ao buscar deck', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
