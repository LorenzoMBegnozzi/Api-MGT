// app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('ScryfallController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    app = moduleFixture.createNestApplication();
    await app.init();

    const payload = { username: 'testuser', sub: 'user-id' };
    token = jwtService.sign(payload);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/scryfall/deck (POST) - Deve criar um deck com sucesso', () => {
    return request(app.getHttpServer())
      .post('/scryfall/deck')
      .set('Authorization', `Bearer ${token}`)
      .send({ commanderName: 'nome-valido-do-comandante' })
      .expect(HttpStatus.CREATED)
      .then(response => {
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('commander');
        expect(response.body.cards).toHaveLength(100);
      });
  });

  it('/scryfall/deck (POST) - Deve retornar 404 para comandante inválido', () => {
    return request(app.getHttpServer())
      .post('/scryfall/deck')
      .set('Authorization', `Bearer ${token}`)
      .send({ commanderName: 'nome-invalido-do-comandante' })
      .expect(HttpStatus.NOT_FOUND)
      .then(response => {
        expect(response.body.message).toBe('Comandante não encontrado'); 
      });
  });

  it('/scryfall/deck (POST) - Deve retornar 401 para usuário não autenticado', () => {
    return request(app.getHttpServer())
      .post('/scryfall/deck')
      .send({ commanderName: 'nome-valido-do-comandante' }) 
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/scryfall/deck (POST) - Deve retornar 400 para payload incompleto', () => {
    return request(app.getHttpServer())
      .post('/scryfall/deck')
      .set('Authorization', `Bearer ${token}`)
      .send({}) 
      .expect(HttpStatus.BAD_REQUEST);
  });
});
