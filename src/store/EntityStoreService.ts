import { Injectable } from '@nestjs/common';
import { EntityStoreRepository } from './EntityStoreRepository';

@Injectable()
export class EntityStoreService {
  constructor(private repository: EntityStoreRepository) {}

  async saveEntity(entity: any, entityType: string) {
    const { entitySchema } = await this.repository.getModelMeta(entityType);
    const entityId = entity[entitySchema.getIdField()];
    if (!entityId) return null;
    const existing = await this.repository.fetchById(entityType, entityId);
    if (existing) {
      await this.repository.updateEntity(entityType, entityId, entity);
    } else {
      await this.repository.insertEntity(entityType, entity);
    }
  }

  async refreshStore(entityType: string) {
    await this.repository.refreshCache(entityType);
    await this.repository.updateIndex(entityType);
  }
}
