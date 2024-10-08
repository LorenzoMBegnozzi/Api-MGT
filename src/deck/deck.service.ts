import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
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

  async createCustomDeck(commander: any, cards: any[], userId: string): Promise<Deck> {
    try {
      if (!commander || !commander.color_identity || commander.color_identity.length === 0) {
        throw new NotFoundException(`O comandante fornecido não possui identidade de cor.`);
      }

      console.log('Cartas recebidas:', cards);

      const validCards = cards.filter(card => {
        console.log('Verificando carta:', card);
        return card && card.name && card.type;
      });

      console.log('Cartas válidas:', validCards);

      const savedCards = await Promise.all(
        validCards.map(async (card) => {
          try {
            const newCard = new this.cardModel({
              name: card.name,
              type: card.type,
              manaCost: card.manaCost,
              colors: card.colors,
              scryfallId: card.scryfallId,
              imageUrl: card.imageUrl || '',
            });

            return await newCard.save();
          } catch (error) {
            console.error(`Erro ao salvar a carta "${card.name}":`, error);
            return null;
          }
        })
      );

      const filteredSavedCards = savedCards.filter(card => card !== null);

      if (filteredSavedCards.length === 0) {
        throw new NotFoundException('Nenhuma carta foi salva.');
      }

      const deck = new this.deckModel({
        commander: commander.name,
        cards: filteredSavedCards.map(savedCard => savedCard._id),
        user: userId,
      });

      return await deck.save();
    } catch (error) {
      console.error('Erro ao criar o deck customizado:', error);
      throw new InternalServerErrorException(`Erro ao criar deck customizado: ${error.message}`);
    }
  }

  private async getCardFromScryfall(cardName: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/named?exact=${cardName}`)
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar a carta '${cardName}':`, error);
      return null;
    }
  }

  async createDeck(commanderName: string, userId: string): Promise<Deck> {
    console.log(`Buscando comandante: ${commanderName}`);

    try {
      const commanderResponse = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/named?exact=${commanderName}`)
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

      // buscar cartas pela cor do comandante
      const cardsResponse = await firstValueFrom(
        this.httpService.get(
          `https://api.scryfall.com/cards/search?q=color_identity<=${colorIdentity}&unique=cards&order=edhrec`
        )
      );

      console.log('Cartas encontradas:', cardsResponse.data);

      const cards = cardsResponse.data.data;
      const deckCards = cards.slice(0, 99); // primeiras 99 cartas

      // salvar as cartas do db
      const savedCards = await Promise.all(
        deckCards.map(async card => {
          if (!card.id) {
            throw new BadRequestException(`A carta '${card.name}' não possui um ID definido.`);
          }

          try {
            const newCard = new this.cardModel({
              name: card.name,
              type: card.type_line,
              manaCost: card.mana_cost,
              colors: card.colors,
              imageUrl: card.image_uris?.normal || '',
            });

            return await newCard.save();
          } catch (error) {
            console.error(`Erro ao salvar a carta '${card.name}': ${error.message}`);
            throw new InternalServerErrorException(`Erro ao salvar a carta '${card.name}'.`);
          }
        })
      );

      // criar o deck e mandar para o usuário dono
      const deck = new this.deckModel({
        commander: commander.name,
        cards: savedCards.map(savedCard => savedCard._id),
        user: userId,
      });

      // verifica se todos os IDs das cartas estão definidos
      if (!deck.cards.every(cardId => cardId)) {
        throw new BadRequestException('Um ou mais IDs de cartas são indefinidos.');
      }

      console.log('Deck criado:', deck);
      return await deck.save();
    } catch (error) {
      console.error('Erro ao criar deck:', error);
      throw new InternalServerErrorException('Erro ao criar deck');
    }
  }

  // buscar VARIOS decks por ID de usuario
  async getDecksByUserId(userId: string): Promise<Deck[]> {
    try {
      const decks = await this.deckModel.find({ user: userId }).populate('cards').exec();
      return decks;
    } catch (error) {
      console.error('Erro ao buscar decks pelo ID do usuário:', error);
      throw new InternalServerErrorException('Erro ao buscar decks');
    }
  }

  // buscar UM deck por ID (admin e usuario podem )
  async getDeckById(id: string): Promise<Deck> {
    try {
      const deck = await this.deckModel.findById(id).populate('cards').exec();
      if (!deck) {
        throw new NotFoundException(`Deck com ID ${id} não encontrado.`);
      }
      return deck;
    } catch (error) {
      console.error(`Erro ao buscar o deck com ID ${id}:`, error);
      throw new InternalServerErrorException('Erro ao buscar deck');
    }
  }

  // buscar todos os decks (admin)
  async getAllDecks(): Promise<Deck[]> {
    try {
      const decks = await this.deckModel.find().populate('cards').exec();
      return decks;
    } catch (error) {
      console.error('Erro ao buscar todos os decks:', error);
      throw new InternalServerErrorException('Erro ao buscar decks');
    }
  }
}
