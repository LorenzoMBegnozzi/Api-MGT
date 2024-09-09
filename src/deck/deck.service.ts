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

  async createDeck(commanderName: string): Promise<Deck> {
    console.log(`Buscando comandante: ${commanderName}`);

    const commanderResponse = await firstValueFrom(
      this.httpService.get(`https://api.scryfall.com/cards/named?exact=${commanderName}`),
    );

    if (!commanderResponse.data) {
      throw new NotFoundException(`Comandante ${commanderName} não encontrado.`);
    }

    const commander = commanderResponse.data;
    console.log('Comandante encontrado:', commander);

    if (!commander.color_identity || commander.color_identity.length === 0) {
      throw new NotFoundException(`Comandante ${commanderName} não possui identidade de cor.`);
    }

    const colorIdentity = commander.color_identity.join('');
    console.log('Identidade de cor:', colorIdentity);

    const cardsResponse = await firstValueFrom(
      this.httpService.get(`https://api.scryfall.com/cards/search?q=color_identity<=${colorIdentity}&unique=cards&order=edhrec`),
    );

    console.log('Cartas encontradas:', cardsResponse.data);

    const cards = cardsResponse.data.data;
    const deckCards = cards.slice(0, 99);

    const savedCards = await Promise.all(
      deckCards.map(async card => {
        const newCard = new this.cardModel({
          name: card.name,
          type: card.type_line,
          manaCost: card.mana_cost,
          colors: card.colors,
          imageUrl: card.image_uris?.normal || '',
        });
        return newCard.save();
      }),
    );

   
    const deck = new this.deckModel({
      commander: commander.name,
      cards: savedCards.map(savedCard => savedCard._id),
    });

    console.log('Deck criado:', deck);

    return deck.save();
  }
}
