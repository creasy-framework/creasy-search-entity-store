import { Injectable } from '@nestjs/common';
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

  private async getEntitySchemas() {
    const schemas = await this.entitySchemaRepository.getLatestSchemas();
    const entitySchemas = schemas.map((schema) =>
      EntitySchema.fromJson(schema),
    );
    return entitySchemas;
  }

  async execute(query: string) {
    const entitySchemas = await this.getEntitySchemas();
    const graphQLSchemaAsString = this.schemaGenerator.generate(entitySchemas);
    const resolvers = this.resolverGenerator.generate(entitySchemas);
    const graphQLSchema = buildSchema(graphQLSchemaAsString);
    return await graphql(graphQLSchema, query, resolvers);
  }

  async getSchema() {
    const entitySchemas = await this.getEntitySchemas();
    return this.schemaGenerator.generate(entitySchemas);
  }
}
