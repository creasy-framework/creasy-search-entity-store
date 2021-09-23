import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { EntitySchemaRegistryController } from './EntitySchemaRegistryController';
import { EntitySchemaRegistryService } from './EntitySchemaRegistryService';
import { EntitySchemaValidator } from './validators/EntitySchemaValidator';
import { EntitySchemaRegistryRepository } from './EntitySchemaRegistryRepository';
import {
  EntitySchemaDocument,
  EntitySchemaDocumentSchema,
} from './EntitySchemaDocument';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.ENTITY_STORE_DB_HOST, {
      useNewUrlParser: true,
    }),
    MongooseModule.forFeature([
      {
        name: EntitySchemaDocument.name,
        schema: EntitySchemaDocumentSchema,
      },
    ]),
    CacheModule.register({
      store: redisStore,
      host: process.env.CACHE_HOST,
      port: process.env.CACHE_PORT,
      ttl: Number(process.env.CACHE_TTL),
    }),
  ],
  controllers: [EntitySchemaRegistryController],
  providers: [
    EntitySchemaValidator,
    EntitySchemaRegistryService,
    EntitySchemaRegistryRepository,
  ],
  exports: [EntitySchemaRegistryRepository],
})
export class EntitySchemaRegistryModule {}
