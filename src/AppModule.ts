import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { EntitySchemaRegistryModule } from './schema';
import { EntityStoreGraphQLModule } from './graphql';
import { EntityStoreModule } from './store';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        quietReqLogger: true,
        autoLogging: false,
        genReqId: (req) => req.headers['x-correlation-id'],
        customAttributeKeys: {
          reqId: 'correlation_id',
        },
      },
    }),
    EntitySchemaRegistryModule,
    EntityStoreGraphQLModule,
    EntityStoreModule,
  ],
})
export class AppModule {}
