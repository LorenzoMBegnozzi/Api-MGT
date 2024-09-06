import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class ScryfallService {
  constructor(private readonly httpService: HttpService) {}

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
}
