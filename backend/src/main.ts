import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors
          .map((e) => `${e.property}: ${Object.values(e.constraints || {}).join(', ')}`)
          .join('; ');
        return new BadRequestException(messages);
      },
    }),
  );

  // WebSocket adapter
  const { IoAdapter } = await import('@nestjs/platform-socket.io');
  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 SentinelX Backend running on port ${port}`);
}

bootstrap();
