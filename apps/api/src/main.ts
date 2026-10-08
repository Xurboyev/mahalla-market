import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',') });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('MahallaMarket API').setVersion('0.1.0').addBearerAuth().build(),
  );
  SwaggerModule.setup('docs', app, doc);

  await app.listen(Number(process.env.PORT ?? 4000), '0.0.0.0');
}
bootstrap();
