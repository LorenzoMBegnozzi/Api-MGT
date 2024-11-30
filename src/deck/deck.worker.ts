import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DeckService } from './deck.service';

@Injectable()
export class DeckWorker {
  constructor(
    private readonly deckService: DeckService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: 'deck_exchange',
    routingKey: 'deck_import_queue',
    queue: 'deck_import_queue',
  })
  async handleDeckImport(message: any) {
    const { userId, commander, cards } = message;

    try {
      // Processa a importação do deck
      const savedDeck = await this.deckService.createCustomDeck(commander, cards, userId);

      // Envia notificação de sucesso
      this.amqpConnection.publish('deck_exchange', 'deck_updates_queue', {
        userId,
        deckId: savedDeck._id,
        status: 'imported',
      });
    } catch (error) {
      console.error(`Erro ao processar importação do deck: ${error.message}`);
    }
  }
}
