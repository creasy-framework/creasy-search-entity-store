import { Module } from '@nestjs/common';
import { EntitySchemaRegistryModule } from '../schema';
import { EntityStoreGraphQLService } from './EntityStoreGraphQLService';
import { EntityStoreGraphQLController } from './EntityStoreGraphQLController';
import { EntityStoreGraphQLSchemaGenerator } from './EntityStoreGraphQLSchemaGenerator';
import { EntityStoreGraphQLResolverGenerator } from './EntityStoreGraphQLResolverGenerator';
import { EntityStoreModule } from '../store';
import { EventService } from '../event';
@Module({
  imports: [EntitySchemaRegistryModule, EntityStoreModule],
  controllers: [EntityStoreGraphQLController],
  providers: [
    EventService,
    EntityStoreGraphQLService,
    EntityStoreGraphQLSchemaGenerator,
    EntityStoreGraphQLResolverGenerator,
  ],
})
export class EntityStoreGraphQLModule {}
