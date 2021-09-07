import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EntitySchemaRegistryController } from './EntitySchemaRegistryController';
import { EntitySchemaRegistryService } from './EntitySchemaRegistryService';
import { EntitySchemaValidator } from './entity-schema-validators/EntitySchemaValidator';
import { EntitySchemaRegistryRepository } from './EntitySchemaRegistryRepository';
import {
  EntitySchemaDocument,
  EntitySchemaDocumentSchema,
} from './EntitySchemaDocument';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.ENTITY_SCHEMA_STORAGE_HOST, {
      useNewUrlParser: true,
    }),
    MongooseModule.forFeature([
      {
        name: EntitySchemaDocument.name,
        schema: EntitySchemaDocumentSchema,
      },
    ]),
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
