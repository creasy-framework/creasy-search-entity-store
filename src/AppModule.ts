import { Module } from '@nestjs/common';
import { EntitySchemaRegistryModule } from './schema';
import { EntityStoreGraphQLModule } from './graphql';
import { EntityStoreModule } from './store';

@Module({
  imports: [
    EntitySchemaRegistryModule,
    EntityStoreGraphQLModule,
    EntityStoreModule,
  ],
})
export class AppModule {}
