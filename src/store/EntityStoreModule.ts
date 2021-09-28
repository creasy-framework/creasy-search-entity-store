import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { EntityStoreRepository } from './EntityStoreRepository';
import { EntitySchemaMapper } from './EntitySchemaMapper';
import { EntitySchemaRegistryModule } from '../schema';
import { EntityStoreController } from './EntityStoreController';
import { EventModule } from '../event';
import { EntityStoreService } from './EntityStoreService';
import { EventHandler } from './EventHandler';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.CACHE_HOST,
      port: process.env.CACHE_PORT,
      ttl: Number(process.env.CACHE_TTL),
    }),
    EntitySchemaRegistryModule,
    EventModule,
  ],
  controllers: [EntityStoreController],
  providers: [
    EntityStoreService,
    EntityStoreRepository,
    EntitySchemaMapper,
    EventHandler,
  ],
  exports: [EntityStoreService, EntityStoreRepository],
})
export class EntityStoreModule {}
