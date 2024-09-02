import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure o rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limita cada IP a 100 requisições por 'windowMs'
  });

  // Aplicar o rate limiter a todas as rotas
  app.use(limiter);

  await app.listen(3000);
}
bootstrap();
