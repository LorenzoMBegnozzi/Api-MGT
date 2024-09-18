import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limita cada IP a 100 requisições por janela
  });

  // Aplicar o rate limiter a todas as requisições
  app.use(limiter);

  await app.listen(3000);
}
bootstrap();
