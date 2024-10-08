import {
  Controller,Post,Body,Get,UseGuards,Request,Param,BadRequestException,InternalServerErrorException,UseInterceptors,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/decorators/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { validateCommanderDeck } from './schemas/commander-validator';
import { DeckJson } from 'src/interfaces/deck.interface';
import { CacheInterceptor } from '@nestjs/cache-manager'; 

@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  // criar um deck
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createDeck(@Body('commanderName') commanderName: string, @Body('userId') userId: string) {
    try {
      const deck = await this.deckService.createDeck(commanderName, userId);
      return deck;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao criar o deck: ${error.message}`);
    }
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  async importDeck(@Body() deckJson: DeckJson, @Request() req) {
    const userId = req.user.userId;
    const { commander, cards } = deckJson;

    if (!Array.isArray(cards) || cards.length < 1 || cards.length > 99) {
      throw new BadRequestException('O deck deve conter entre 1 e 99 cartas além do comandante.');
    }

    if (typeof commander !== 'object' || !commander.name) {
      throw new BadRequestException('O comandante deve ser um objeto válido com uma propriedade "name".');
    }

    // regras do Commander
    const isValid = validateCommanderDeck(commander, cards);
    if (!isValid.valid) {
      throw new BadRequestException(isValid.message);
    }

    try {
      const savedDeck = await this.deckService.createCustomDeck(commander, cards, userId);
      return savedDeck;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao importar o deck: ${error.message}`);
    }
  }

  // buscar todos os decks (acesso admin)
  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  async getAllDecks() {
    try {
      const decks = await this.deckService.getAllDecks();
      return decks;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar todos os decks: ${error.message}`);
    }
  }

  @Get('my-decks')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CacheInterceptor) //cacheInterceptor 
  async getMyDecks(@Request() req) {
    const userId = req.user.userId;
    console.log('User ID:', userId);

    try {
      const decks = await this.deckService.getDecksByUserId(userId);
      //retorna mensagem se n tiver deck
      if (decks.length === 0) {
        return { message: 'Você não tem nenhum deck criado.' };
      }
      return decks;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar seus decks: ${error.message}`);
    }
  }

  // VÁRIOS decks por ID de usuario
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin, Role.User) // admin e user podem acessar
  async getDecksByUserId(@Param('userId') userId: string) {
    try {
      const decks = await this.deckService.getDecksByUserId(userId);
      return decks;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao buscar decks do usuário ${userId}: ${error.message}`);
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
      throw new InternalServerErrorException(`Erro ao buscar o deck com ID ${id}: ${error.message}`);
    }
  }
}
