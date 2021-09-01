import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
};
bootstrap();
