import { Controller, Post, Body, Get, Query, UseGuards, Param } from '@nestjs/common';
import { DeckService } from './deck.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { Roles } from '../auth/decorators/roles.decorator'; // Altere o caminho conforme necessário
import { RolesGuard } from '../auth/guards/roles.guard'; // Altere o caminho conforme necessário
import { Role } from 'src/auth/decorators/role.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  // Criar um deck
  @Post('create')
  async createDeck(@Body('commanderName') commanderName: string, @Body('userId') userId: string) {
    try {
      const deck = await this.deckService.createDeck(commanderName, userId);
      return deck;
    } catch (error) {
      throw new Error(`Erro ao criar o deck: ${error.message}`);
    }
  }

  // Buscar todos os decks (acesso restrito ao admin)
  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin) // Apenas admin pode acessar essa rota
  async getAllDecks() {
    try {
      const decks = await this.deckService.getAllDecks();
      return decks;
    } catch (error) {
      throw new Error(`Erro ao buscar todos os decks: ${error.message}`);
    }
  }

  // Buscar decks por ID de usuário (usuário admin pode ver decks de qualquer usuário)
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin, Role.User) // Admin e User podem acessar essa rota
  async getDecksByUserId(@Param('userId') userId: string) {
    try {
      const decks = await this.deckService.getDecksByUserId(userId);
      return decks;
    } catch (error) {
      throw new Error(`Erro ao buscar decks do usuário ${userId}: ${error.message}`);
    }
  }

  // Buscar deck por ID (admin pode ver qualquer deck)
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin, Role.User) // Admin e User podem acessar essa rota
  async getDeckById(@Param('id') id: string) {
    try {
      const deck = await this.deckService.getDeckById(id);
      return deck;
    } catch (error) {
      throw new Error(`Erro ao buscar o deck com ID ${id}: ${error.message}`);
    }
  }
}
