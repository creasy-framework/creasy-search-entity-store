import { Injectable, Logger } from '@nestjs/common';
import { graphql, buildSchema } from 'graphql';
import { EntitySchema, EntitySchemaRegistryRepository } from '../schema';
import { EntityStoreGraphQLSchemaGenerator } from './EntityStoreGraphQLSchemaGenerator';
import { EntityStoreGraphQLResolverGenerator } from './EntityStoreGraphQLResolverGenerator';

@Injectable()
export class EntityStoreGraphQLService {
  constructor(
    private entitySchemaRepository: EntitySchemaRegistryRepository,
    private schemaGenerator: EntityStoreGraphQLSchemaGenerator,
    private resolverGenerator: EntityStoreGraphQLResolverGenerator,
  ) {}
  async execute(query: string) {
    const schemas = await this.entitySchemaRepository.getLatestSchemas();
    const entitySchemas = schemas.map((schema) =>
      EntitySchema.fromJson(schema),
    );
    const graphQLSchemaAsString = this.schemaGenerator.generate(entitySchemas);
    const resolvers = this.resolverGenerator.generate(entitySchemas);
    const graphQLSchema = buildSchema(graphQLSchemaAsString);
    return await graphql(graphQLSchema, query, resolvers);
  }
}
