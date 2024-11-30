import { Controller, Post, Body, UseGuards, Request, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DeckService } from './deck.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeckJson } from 'src/interfaces/deck.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Controller('decks')
export class DeckController {
  constructor(
    private readonly deckService: DeckService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

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

    try {
      // Envia a mensagem para a fila `deck_import_queue`
      this.amqpConnection.publish('deck_exchange', 'deck_import_queue', {
        userId,
        commander,
        cards,
      });

      return { message: 'Importação de deck iniciada com sucesso.' };
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao iniciar a importação: ${error.message}`);
    }
  }
}
