import { Injectable, Logger } from '@nestjs/common';
import { EntityStoreService } from './EntityStoreService';
import {
  ENTITY_SCHEMA_UPDATE_EVENT,
  ENTITY_UPDATE_EVENT,
  EventService,
} from '../event';

@Injectable()
export class EventHandler {
  constructor(
    private readonly entityStoreService: EntityStoreService,
    private readonly eventService: EventService,
  ) {
    this.eventService.subscribe(
      ENTITY_UPDATE_EVENT,
      this.onEntityUpdate.bind(this),
    );
    this.eventService.subscribe(
      ENTITY_SCHEMA_UPDATE_EVENT,
      this.onEntitySchemaUpdate.bind(this),
    );
  }

  async onEntityUpdate(event: string, entityType: string) {
    const { correlationId, data } = JSON.parse(event);
    await this.entityStoreService.saveEntity(data, entityType, correlationId);
  }

  async onEntitySchemaUpdate(event: string, entityType: string) {
    await this.entityStoreService.refreshStore(entityType);
  }
}
