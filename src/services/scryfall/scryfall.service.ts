import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CardDocument } from 'src/schemas/card.schema';
import { DeckDocument } from 'src/schemas/deck.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScryfallService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel('Card') private readonly cardModel: Model<CardDocument>,
    @InjectModel('Deck') private readonly deckModel: Model<DeckDocument>,
  ) {}

  // Busca todos os decks do banco de dados por userId
  async getDecksByUserId(userId: string): Promise<DeckDocument[]> {
    try {
      return await this.deckModel.find({ user: userId }).exec();
    } catch (error) {
      console.error('Erro ao buscar decks pelo ID do usuário:', error);
      throw new HttpException('Erro ao buscar decks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Busca todos os decks do banco de dados
  async getAllDecks(): Promise<DeckDocument[]> {
    try {
      return await this.deckModel.find().exec();
    } catch (error) {
      console.error('Erro ao buscar todos os baralhos:', error);
      throw new HttpException('Erro ao buscar baralhos', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Busca carta por ID
  async getCardById(cardId: string): Promise<any> {
    try {
      console.log('Buscando carta com ID:', cardId);
      const response = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/${cardId}`)
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carta por ID:', error);
      throw new HttpException('Erro ao buscar carta por ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Busca carta no Scryfall
  async searchCard(query: string, page: number = 1): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/search?q=${query}&page=${page}`)
      );
      if (!response.data || !response.data.data.length) {
        throw new HttpException('Carta não encontrada', HttpStatus.NOT_FOUND);
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carta:', error);
      throw new HttpException('Erro ao buscar carta', HttpStatus.BAD_REQUEST);
    }
  }

  // Salva o deck no MongoDB
  async saveDeckToDatabase(deck: any[], userId: string, commander: string): Promise<DeckDocument> {
    try {
      const deckDocument = new this.deckModel({
        user: userId,
        commander: commander,
        cards: this.filterDeck(deck),
      });
      const savedDeck = await deckDocument.save();
      console.log('Deck salvo com sucesso:', savedDeck);
      return savedDeck;
    } catch (error) {
      console.error('Erro ao salvar deck no banco de dados:', error);
      throw new HttpException('Erro ao salvar deck', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Salva o deck em um arquivo
  async saveDeckToFile(deck: any[]): Promise<void> {
    try {
      const filePath = path.join(__dirname, 'deck.json');
      fs.writeFileSync(filePath, JSON.stringify(deck, null, 2));
      console.log('Deck salvo em arquivo com sucesso:', filePath);
    } catch (error) {
      console.error('Erro ao salvar deck em arquivo:', error);
      throw new HttpException('Erro ao salvar deck em arquivo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Busca o deck baseado no comandante
  async getDeckByCommander(colors: string[]): Promise<any[]> {
    try {
      const colorQuery = colors.join('');

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/search?q=format:commander+color<=${colorQuery}&order=edhrec&unique=cards`)
      );

      const cards = response.data.data;
      if (!cards.length) {
        throw new HttpException('Cartas não encontradas para este comandante', HttpStatus.NOT_FOUND);
      }

      const deckCards = cards.slice(0, 99).map((card: any) => ({
        _id: card.id,
        name: card.name,
        type: card.type_line,
        manaCost: card.mana_cost,
        colors: card.colors,
        imageUrl: card.image_uris?.normal || null,
      }));

      return deckCards;
    } catch (error) {
      console.error('Erro ao obter deck por comandante:', error);
      throw new HttpException('Erro ao obter deck por comandante', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Filtra o deck para obter apenas os IDs das cartas
  filterDeck(cards: any[]): any[] {
    return cards.map(card => card._id);
  }
}
