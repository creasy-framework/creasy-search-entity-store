import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { EntitySchemaRegistryModule } from '../schema';
import { EntityStoreGraphQLService } from './EntityStoreGraphQLService';
import { EntityStoreGraphQLController } from './EntityStoreGraphQLController';
import { EntityStoreGraphQLSchemaGenerator } from './EntityStoreGraphQLSchemaGenerator';
import { EntityStoreGraphQLResolverGenerator } from './EntityStoreGraphQLResolverGenerator';
import { EntityStoreModule } from '../store';
@Module({
  imports: [
    ConfigModule.forRoot(),
    EntitySchemaRegistryModule,
    EntityStoreModule,
    CacheModule.register({
      store: redisStore,
      host: process.env.CACHE_HOST,
      port: process.env.CACHE_PORT,
      ttl: Number(process.env.CACHE_TTL),
    }),
  ],
  controllers: [EntityStoreGraphQLController],
  providers: [
    EntityStoreGraphQLService,
    EntityStoreGraphQLSchemaGenerator,
    EntityStoreGraphQLResolverGenerator,
  ],
})
export class EntityStoreGraphQLModule {}
