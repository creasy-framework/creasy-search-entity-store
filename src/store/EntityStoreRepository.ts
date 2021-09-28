import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { EntitySchema, EntitySchemaRegistryRepository } from '../schema';
import { EntitySchemaMapper } from './EntitySchemaMapper';
import { LATEST_ENTITY_SCHEMA_VERSION_CACHE_KEY } from './Constants';

@Injectable()
export class EntityStoreRepository {
  private modelMetaMap = new Map<
    string,
    { entitySchema: EntitySchema; model: Model<any> }
  >();

  constructor(
    private schemaMapper: EntitySchemaMapper,
    private entitySchemaRepository: EntitySchemaRegistryRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectConnection() private connection: Connection,
  ) {}

  private getCollectionName(entityType: string) {
    return `ENTITY_${entityType.toUpperCase()}`;
  }

  async refreshCache(entityType: string) {
    Logger.log(
      `Refresh cached model meta for ${entityType}`,
      EntityStoreRepository.name,
    );
    await this.cacheManager.del(
      `${LATEST_ENTITY_SCHEMA_VERSION_CACHE_KEY}_${entityType}`,
    );
    const schema = await this.entitySchemaRepository.getLatestSchema(
      entityType,
    );
    const entitySchema = EntitySchema.fromJson(schema);
    const modelMeta = {
      entitySchema,
      model: this.connection.model(
        entityType,
        this.schemaMapper.map(entitySchema),
        this.getCollectionName(entityType),
      ),
    };
    this.modelMetaMap.set(entityType, modelMeta);
    await this.cacheManager.set(
      `${LATEST_ENTITY_SCHEMA_VERSION_CACHE_KEY}_${entityType}`,
      entitySchema.getVersion(),
    );
    return modelMeta;
  }

  async getModelMeta(entityType: string) {
    const cachedModelMeta = this.modelMetaMap.get(entityType);
    const cachedVersion = await this.cacheManager.get(
      `${LATEST_ENTITY_SCHEMA_VERSION_CACHE_KEY}_${entityType}`,
    );
    if (
      !cachedModelMeta ||
      cachedModelMeta.entitySchema.getVersion() !== cachedVersion
    ) {
      return await this.refreshCache(entityType);
    }

    return cachedModelMeta;
  }

  private wash(doc: any) {
    if (doc) {
      const { _doc } = doc;
      return _doc;
    }
    return doc;
  }

  async insertEntity(entityType: string, doc: any) {
    const { model } = await this.getModelMeta(entityType);
    await model.create(doc);
  }

  async updateEntity(entityType: string, entityId: string, doc: any) {
    const { model, entitySchema } = await this.getModelMeta(entityType);
    const idField = entitySchema.getIdField();
    await model.updateOne(
      { [idField]: entityId },
      { $set: { ...doc, [idField]: entityId } },
    );
  }

  async fetchById(entityType: string, entityId: string | number): Promise<any> {
    const { model, entitySchema } = await this.getModelMeta(entityType);
    const doc: any = await model.findOne({
      [entitySchema.getIdField()]: entityId,
    });
    return this.wash(doc);
  }

  async fetchByIds(
    entityType: string,
    ids: string[] | number[],
  ): Promise<any[]> {
    const { model, entitySchema } = await this.getModelMeta(entityType);
    const docs = await model.find({
      [entitySchema.getIdField()]: { $in: ids },
    });
    return docs.map((doc) => this.wash(doc));
  }

  async fetchByRefId(
    entityType: string,
    refFieldName: string,
    refId: string | number,
  ): Promise<any[]> {
    const { model } = await this.getModelMeta(entityType);
    const docs = await model.find({ [refFieldName]: refId });
    return docs.map((doc) => this.wash(doc));
  }

  async updateIndex(entityType: string): Promise<void> {
    const { entitySchema } = await this.getModelMeta(entityType);
    const promises: Promise<any>[] = [];
    promises.push(
      this.connection.db
        .collection(this.getCollectionName(entityType))
        .createIndex({ [entitySchema.getIdField()]: 1 }),
    );
    const refs = entitySchema.getFields().filter((f) => f.isRefField());
    refs.forEach((ref) => {
      promises.push(
        this.connection.db
          .collection(this.getCollectionName(entityType))
          .createIndex({ [ref.getName()]: 1 }),
      );
    });

    await Promise.all(promises);
    Logger.log(
      `Updated indexes for collection ${entityType}`,
      EntityStoreRepository.name,
    );
  }
}
