import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';

const port = process.env.APP_PORT || 3000;

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
};
bootstrap();
