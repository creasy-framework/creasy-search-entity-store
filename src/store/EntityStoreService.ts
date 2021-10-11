import { Injectable } from '@nestjs/common';
import { EntityStoreRepository } from './EntityStoreRepository';
import { ENTITY_PUBLISHED_EVENT_SUFFIX, EventService } from '../event';

@Injectable()
export class EntityStoreService {
  constructor(
    private readonly repository: EntityStoreRepository,
    private readonly eventService: EventService,
  ) {}

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
    await this.eventService.emit(
      `${entityType}${ENTITY_PUBLISHED_EVENT_SUFFIX}`,
      { key: entityType, value: entityId },
    );
  }

  async refreshStore(entityType: string) {
    await this.repository.refreshCache(entityType);
    await this.repository.updateIndex(entityType);
  }
}