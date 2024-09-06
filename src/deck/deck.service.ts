import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deck } from './deck.schema';
import { Card } from './schemas/card.schema';

@Injectable()
export class DeckService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel('Deck') private deckModel: Model<Deck>,
    @InjectModel('Card') private cardModel: Model<Card>,
  ) { }

  async createDeck(commanderName: string): Promise<any> {

    const commanderResponse = await firstValueFrom(
      this.httpService.get(`https://api.scryfall.com/cards/named?exact=${commanderName}`),
    );
    console.log(commanderName);

    if (!commanderResponse.data) {
      throw new NotFoundException(`Comandante ${commanderName} não encontrado.`);
    }

    const commander = commanderResponse.data;

    const colorIdentity = commander.color_identity.join('');
    const cardsResponse = await firstValueFrom(
      this.httpService.get(`https://api.scryfall.com/cards/search?q=color_identity<=${colorIdentity}&unique=cards&order=edhrec`),
    );

    const cards = cardsResponse.data.data;

    const deckCards = cards.slice(0, 99);

    const deck = new this.deckModel({
      commander: commander.name,
      cards: deckCards.map(card => ({
        name: card.name,
        type: card.type_line,
        manaCost: card.mana_cost,
        colors: card.colors,
        imageUrl: card.image_uris?.normal || '',
      })),
    });

    return deck.save();
  }
}
