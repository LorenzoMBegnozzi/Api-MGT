import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CardDocument } from 'src/schemas/card.schema'; // Certifique-se de importar o CardDocument corretamente
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScryfallService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel('Card') private readonly cardModel: Model<CardDocument>,
  ) {}

  // Método para buscar cartas com base em uma query
  async searchCard(query: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/search?q=${query}`)
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carta:', error);
      throw new HttpException('Erro ao buscar carta', HttpStatus.BAD_REQUEST);
    }
  }

  // Método para obter uma carta por ID
  async getCardById(id: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`https://api.scryfall.com/cards/${id}`)
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carta por ID:', error);
      throw new HttpException('Erro ao buscar carta por ID', HttpStatus.NOT_FOUND);
    }
  }

  // Método para salvar o deck no banco de dados MongoDB
  async saveDeckToDatabase(deck: any[]) {
    console.log('Salvando deck no banco de dados:', deck); // Log para depuração
    const savedDeck = await this.cardModel.insertMany(deck);
    console.log('Deck salvo com sucesso:', savedDeck); // Log para depuração
    return savedDeck;
  }
  

  // Novo método para salvar o deck em um arquivo JSON
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
}
