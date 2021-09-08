import { Injectable } from '@nestjs/common';
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

@Injectable()
export class EntityStoreGraphQLService {
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
    const entitySchemas = await this.getEntitySchemas();
    const graphQLSchemaAsString = this.schemaGenerator.generate(entitySchemas);
    const graphQLSchema = buildSchema(graphQLSchemaAsString);
    const entityGraphQLTypes = this.getEntityTypes(
      entitySchemas,
      graphQLSchema,
    );
    const resolvers = this.resolverGenerator.generate(entityGraphQLTypes);
    return await graphql(graphQLSchema, query, resolvers);
  }

  async getSchema() {
    const entitySchemas = await this.getEntitySchemas();
    return this.schemaGenerator.generate(entitySchemas);
  }
}
