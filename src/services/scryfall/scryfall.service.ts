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
  filterDeck: any;

  constructor(
    private readonly httpService: HttpService,
    @InjectModel('Card') private readonly cardModel: Model<CardDocument>,
    @InjectModel('Deck') private readonly deckModel: Model<DeckDocument>,
  ) { }

  // Método para buscar carta no Scryfall por ID
  async getCardById(id: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/${id}`)
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carta por ID:', error);
      throw new HttpException('Erro ao buscar carta', HttpStatus.BAD_REQUEST);
    }
  }

  // Método para buscar carta no Scryfall
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

  // Método para salvar o deck no MongoDB
  async saveDeckToDatabase(deck: any[], userId: string, commander: string) {
    try {
      const deckDocument = new this.deckModel({
        user: userId,
        commander: commander,
        cards: deck.map(card => card.name),
      });
      const savedDeck = await deckDocument.save();
      console.log('Deck salvo com sucesso:', savedDeck); 
      return savedDeck;
    } catch (error) {
      console.error('Erro ao salvar deck no banco de dados:', error);
      throw new HttpException('Erro ao salvar deck', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Método para salvar o deck em um arquivo
  async saveDeckToFile(deck: any[]): Promise<void> {
    try {
      const filePath = path.join(__dirname, 'deck.json'); // Defina o caminho do arquivo conforme necessário
      fs.writeFileSync(filePath, JSON.stringify(deck, null, 2));
      console.log('Deck salvo em arquivo com sucesso:', filePath);
    } catch (error) {
      console.error('Erro ao salvar deck em arquivo:', error);
      throw new HttpException('Erro ao salvar deck em arquivo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Método para obter deck baseado no comandante
  async getDeckByCommander(commanderName: string): Promise<any[]> {
    try {
      const commanderData = await this.searchCard(commanderName);

      if (!commanderData || !commanderData.data.length) {
        throw new HttpException('Comandante não encontrado', HttpStatus.NOT_FOUND);
      }

      const commander = commanderData.data[0];
      const colors = commander.colors.join('');

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/search?q=format:commander+color<=${colors}&order=edhrec&unique=cards`)
      );

      const cards = response.data.data;
      if (!cards.length) {
        throw new HttpException('Cartas não encontradas para este comandante', HttpStatus.NOT_FOUND);
      }

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
