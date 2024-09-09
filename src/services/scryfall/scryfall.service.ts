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

  // Método para buscar carta no Scryfall por ID
  async getCardById(cardId: string) {
    try {
      console.log('Buscando carta com ID:', cardId);
      const response = await this.httpService.get(`https://api.scryfall.com/cards/${cardId}`).toPromise();
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carta por ID:', error);
      throw new Error('Erro ao buscar carta por ID');
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
        user: userId, // Passa o userId corretamente
        commander: commander,
        cards: this.filterDeck(deck), // Usa a função filterDeck para obter os IDs das cartas
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

      // Mapeia as cartas para o formato desejado, incluindo o campo _id se disponível
      const deckCards = cards.slice(0, 99).map((card: any) => ({
        _id: card.id, // Certifique-se de adicionar o campo _id se necessário
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

  // Função para filtrar e transformar as cartas
  filterDeck(cards: any[]): any[] {
    // Retorna apenas os IDs das cartas, assumindo que cada carta tem um campo _id
    return cards.map(card => card._id); // Ajuste conforme a estrutura dos dados
  }
}
