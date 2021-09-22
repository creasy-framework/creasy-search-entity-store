import { Injectable, Logger } from '@nestjs/common';
import {
  graphql,
  buildSchema,
  GraphQLSchema,
  ExecutionResult,
  GraphQLObjectType,
} from 'graphql';
import { EntitySchema, EntitySchemaRegistryRepository } from '../schema';
import { EntityStoreGraphQLSchemaGenerator } from './EntityStoreGraphQLSchemaGenerator';
import { EntityStoreGraphQLResolverGenerator } from './EntityStoreGraphQLResolverGenerator';
import { ENTITY_SCHEMA_UPDATED, Observe, On } from '../event';
import { EntityResolver } from './Types';

@Observe([ENTITY_SCHEMA_UPDATED])
@Injectable()
export class EntityStoreGraphQLService {
  private cachedResolver: EntityResolver;
  private cachedGraphQLSchema: GraphQLSchema;
  private cachedGraphQLSchemaString: string;

  constructor(
    private entitySchemaRepository: EntitySchemaRegistryRepository,
    private schemaGenerator: EntityStoreGraphQLSchemaGenerator,
    private resolverGenerator: EntityStoreGraphQLResolverGenerator,
  ) {}

  private async getEntitySchemas(): Promise<EntitySchema[]> {
    const schemas = await this.entitySchemaRepository.getLatestSchemas();
    const entitySchemas = schemas.map((schema) =>
      EntitySchema.fromJson(schema),
    );
    return entitySchemas;
  }

  private getEntityTypes(
    entitySchemas: EntitySchema[],
    graphQLSchema: GraphQLSchema,
  ): GraphQLObjectType[] {
    return entitySchemas.map(
      (entitySchema) =>
        graphQLSchema.getTypeMap()[
          entitySchema.getEntityType()
        ] as GraphQLObjectType,
    );
  }

  async execute(query: string): Promise<ExecutionResult> {
    if (!this.cachedGraphQLSchema || !this.cachedResolver) {
      await this.refreshCache();
    }
    return await graphql(this.cachedGraphQLSchema, query, this.cachedResolver);
  }

  async getSchema() {
    if (!this.cachedGraphQLSchemaString) {
      await this.refreshCache();
    }
    return this.cachedGraphQLSchemaString;
  }

  @On(ENTITY_SCHEMA_UPDATED)
  private async refreshCache() {
    Logger.log('Generating GraphQL schema and resolvers');
    const entitySchemas = await this.getEntitySchemas();
    this.cachedGraphQLSchemaString =
      this.schemaGenerator.generate(entitySchemas);
    this.cachedGraphQLSchema = buildSchema(this.cachedGraphQLSchemaString);
    const entityGraphQLTypes = this.getEntityTypes(
      entitySchemas,
      this.cachedGraphQLSchema,
    );
    this.cachedResolver = this.resolverGenerator.generate(entityGraphQLTypes);
  }
}
