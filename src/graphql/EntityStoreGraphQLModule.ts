import { Module } from '@nestjs/common';
import { EntitySchemaRegistryModule } from '../schema';
import { EntityStoreGraphQLService } from './EntityStoreGraphQLService';
import { EntityStoreGraphQLController } from './EntityStoreGraphQLController';
import { EntityStoreGraphQLSchemaGenerator } from './EntityStoreGraphQLSchemaGenerator';
import { EntityStoreGraphQLResolverGenerator } from './EntityStoreGraphQLResolverGenerator';
import { EntityStoreModule } from '../store';
@Module({
  imports: [EntitySchemaRegistryModule, EntityStoreModule],
  controllers: [EntityStoreGraphQLController],
  providers: [
    EntityStoreGraphQLService,
    EntityStoreGraphQLSchemaGenerator,
    EntityStoreGraphQLResolverGenerator,
  ],
})
export class EntityStoreGraphQLModule {}
