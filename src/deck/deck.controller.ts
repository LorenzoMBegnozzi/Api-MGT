import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { DeckService } from './deck.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/decorators/role.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  // criar um deck
  @Post('create')
  @UseGuards(AuthGuard('jwt')) // rota para usuarios autenticados
  async createDeck(@Body('commanderName') commanderName: string, @Body('userId') userId: string) {
    try {
      const deck = await this.deckService.createDeck(commanderName, userId);
      return deck;
    } catch (error) {
      throw new Error(`Erro ao criar o deck: ${error.message}`);
    }
  }

  // buscar todos os decks (acesso admin)
  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin) // só admin pode acessar a rota
  async getAllDecks() {
    try {
      const decks = await this.deckService.getAllDecks();
      return decks;
    } catch (error) {
      throw new Error(`Erro ao buscar todos os decks: ${error.message}`);
    }
  }

  @Get('my-decks')
@UseGuards(AuthGuard('jwt'))
async getMyDecks(@Request() req) {
  const userId = req.user.userId;
  console.log('User ID:', userId);
  
  try {
    const decks = await this.deckService.getDecksByUserId(userId);
    // se n tiver deck, retorna mensagem
    if (decks.length === 0) {
      return { message: 'Você não tem nenhum deck criado.' }; 
    }
    return decks;
  } catch (error) {
    throw new Error(`Erro ao buscar seus decks: ${error.message}`);
  }
}

  // buscar VARIOS decks por ID de usuário
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin, Role.User) // admin e user podem acessar 
  async getDecksByUserId(@Param('userId') userId: string) {
    try {
      const decks = await this.deckService.getDecksByUserId(userId);
      return decks;
    } catch (error) {
      throw new Error(`Erro ao buscar decks do usuário ${userId}: ${error.message}`);
    }
  }

  // buscar UM deck por id
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin, Role.User) // admin e user podem acessar 
  async getDeckById(@Param('id') id: string) {
    try {
      const deck = await this.deckService.getDeckById(id);
      return deck;
    } catch (error) {
      throw new Error(`Erro ao buscar o deck com ID ${id}: ${error.message}`);
    }
  }
}
