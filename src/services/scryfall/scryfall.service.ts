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
  ) { }

  // Método para salvar o deck no banco de dados MongoDB
  async saveDeckToDatabase(deck: any[], userId: string, commander: string) {
    try {
      console.log('Salvando deck no banco de dados:', deck); // Log para depuração
      const deckDocument = new this.deckModel({
        user: userId,
        commander: commander,
        cards: deck.map(card => card.name),
      });
      const savedDeck = await deckDocument.save();
      console.log('Deck salvo com sucesso:', savedDeck); // Log para depuração
      return savedDeck;
    } catch (error) {
      console.error('Erro ao salvar deck no banco de dados:', error);
      throw new HttpException('Erro ao salvar deck', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Método para buscar cartas com base em uma query
  async searchCard(query: string, page: number = 1): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/search?q=${query}&page=${page}`)
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carta:', error);
      throw new HttpException('Erro ao buscar carta', HttpStatus.BAD_REQUEST);
    }
  }

  async getCardById(id: string): Promise<any> {
    try {
      console.log(`Buscando carta com ID: ${id}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/${id}`)
      );
      console.log('Resposta da API Scryfall:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carta por ID:', error);
      throw new HttpException('Erro ao buscar carta por ID', HttpStatus.NOT_FOUND);
    }
  }
  

  // Método para salvar o deck em um arquivo JSON
  async saveDeckToFile(deck: any[]): Promise<void> {
    const filePath = path.join(__dirname, '../../deck.json');
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(deck, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Erro ao salvar o deck no arquivo:', err);
          return reject(err);
        }
        resolve();
      });
    });
  }

  // Método para filtrar o deck conforme regras do Commander
  filterDeck(cards: any[]): any[] {
    if (!Array.isArray(cards)) {
      throw new Error('Esperado um array de cartas');
    }

    const deck = [];
    const basicLands = new Set(['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']);

    for (const card of cards) {
      if (deck.length >= 99) break;

      const isBasicLand = basicLands.has(card.name);

      if (isBasicLand || !deck.find(c => c.name === card.name)) {
        deck.push(card);
      }
    }

    return deck;
  }

  // Método para obter um deck baseado no comandante
  async getDeckByCommander(commanderName: string): Promise<any[]> {
    try {
      // Obtenha os dados do comandante
      const commanderData = await this.searchCard(commanderName);

      if (!commanderData || !commanderData.data || !commanderData.data.length) {
        throw new HttpException('Comandante não encontrado', HttpStatus.NOT_FOUND);
      }

      const commander = commanderData.data[0];
      const colors = commander.colors.join('');

      // Buscar as cartas que podem fazer parte do deck baseado nas cores do comandante
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/search?q=format:commander+color<=${colors}&order=edhrec&unique=cards`)
      );

      const cards = response.data.data;

      // Limitar o deck a 99 cartas
      const deckCards = this.filterDeck(cards).slice(0, 99);

      return deckCards.map((card: any) => ({
        name: card.name,
        type: card.type_line,
        manaCost: card.mana_cost,
        colors: card.colors,
        imageUrl: card.image_uris?.normal || null,
      }));
    } catch (error) {
      console.error('Erro ao obter deck por comandante:', error);
      throw new HttpException('Erro ao obter deck por comandante', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
