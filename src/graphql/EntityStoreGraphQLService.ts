import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
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
import { EntityResolver } from './Types';
import { GRAPHQL_SCHEMA_VERSION_CACHE_KEY } from './Constants';

@Injectable()
export class EntityStoreGraphQLService {
  private cachedResolver: EntityResolver;
  private cachedGraphQLSchema: GraphQLSchema;
  private cachedGraphQLSchemaString: string;
  private lastSchemaVersion: string;

  constructor(
    private entitySchemaRepository: EntitySchemaRegistryRepository,
    private schemaGenerator: EntityStoreGraphQLSchemaGenerator,
    private resolverGenerator: EntityStoreGraphQLResolverGenerator,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const isCacheInvalid = await this.isCacheInvalid();
    if (isCacheInvalid) {
      await this.refreshCache();
    }
    return await graphql(this.cachedGraphQLSchema, query, this.cachedResolver);
  }

  async getSchema() {
    const isCacheInvalid = await this.isCacheInvalid();
    if (isCacheInvalid) {
      await this.refreshCache();
    }
    return this.cachedGraphQLSchemaString;
  }

  private async isCacheInvalid() {
    const schemaVersion = await this.cacheManager.get<string>(
      GRAPHQL_SCHEMA_VERSION_CACHE_KEY,
    );
    return !this.lastSchemaVersion || this.lastSchemaVersion !== schemaVersion;
  }

  async refreshCache() {
    Logger.log(
      'Generating GraphQL schema and resolvers',
      EntityStoreGraphQLService.name,
    );
    const entitySchemas = await this.getEntitySchemas();
    this.cachedGraphQLSchemaString =
      this.schemaGenerator.generate(entitySchemas);
    this.cachedGraphQLSchema = buildSchema(this.cachedGraphQLSchemaString);
    const entityGraphQLTypes = this.getEntityTypes(
      entitySchemas,
      this.cachedGraphQLSchema,
    );
    this.cachedResolver = this.resolverGenerator.generate(entityGraphQLTypes);
    this.lastSchemaVersion =
      this.schemaGenerator.generateVersion(entitySchemas);
    await this.cacheManager.set<string>(
      GRAPHQL_SCHEMA_VERSION_CACHE_KEY,
      this.lastSchemaVersion,
    );
  }
}
