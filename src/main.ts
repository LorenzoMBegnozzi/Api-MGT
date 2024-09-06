import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
  });

  app.use(limiter);

  await app.listen(3000);
}
bootstrap();
