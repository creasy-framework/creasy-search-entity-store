import { Injectable } from '@nestjs/common';
import { EntityStoreRepository } from './EntityStoreRepository';
import { ENTITY_CHANGED_EVENT, EventService } from '../event';
import { ENTITY_MUTATION_TYPE } from './Constants';

@Injectable()
export class EntityStoreService {
  constructor(
    private readonly repository: EntityStoreRepository,
    private readonly eventService: EventService,
  ) {}

  async saveEntity(entity: any, entityType: string, correlationId: string) {
    const { entitySchema } = await this.repository.getModelMeta(entityType);
    const entityId = entity[entitySchema.getIdField()];
    if (!entityId) return null;
    const existing = await this.repository.fetchById(entityType, entityId);
    if (existing) {
      await this.repository.updateEntity(entityType, entityId, entity);
    } else {
      await this.repository.insertEntity(entityType, entity);
    }
    await this.eventService.emit(ENTITY_CHANGED_EVENT, {
      key: entityType,
      value: JSON.stringify({
        correlationId,
        data: {
          entityType,
          id: entityId,
          mutationType: ENTITY_MUTATION_TYPE.UPSERT,
        },
      }),
    });
  }

  async deleteEntity(entityId: any, entityType: string, correlationId: string) {
    await this.repository.deleteEntity(entityType, entityId);
    await this.eventService.emit(ENTITY_CHANGED_EVENT, {
      key: entityType,
      value: JSON.stringify({
        correlationId,
        data: {
          entityType,
          id: entityId,
          mutationType: ENTITY_MUTATION_TYPE.REMOVE,
        },
      }),
    });
  }

  async refreshStore(entityType: string) {
    await this.repository.refreshCache(entityType);
    await this.repository.updateIndex(entityType);
  }
}
