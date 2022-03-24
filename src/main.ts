import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './AppModule';
import { AppExceptionFilter } from './AppExceptionFilter';
import { CorrelationIdMiddleware } from '@eropple/nestjs-correlation-id';

const port = process.env.APP_PORT || 3000;

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.use(CorrelationIdMiddleware());
  app.useGlobalFilters(new AppExceptionFilter());
  app.useLogger(app.get(Logger));
  await app.listen(port);
};
bootstrap();
