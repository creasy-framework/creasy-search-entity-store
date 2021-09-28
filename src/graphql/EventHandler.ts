import { Injectable } from '@nestjs/common';
import { EntityStoreGraphQLService } from './EntityStoreGraphQLService';
import { ENTITY_SCHEMA_UPDATE_EVENT, EventService } from '../event';

@Injectable()
export class EventHandler {
  constructor(
    private readonly entityStoreGraphQLService: EntityStoreGraphQLService,
    private readonly eventService: EventService,
  ) {
    this.eventService.subscribe(
      ENTITY_SCHEMA_UPDATE_EVENT,
      this.onEntitySchemaUpdate.bind(this),
    );
  }

  async onEntitySchemaUpdate() {
    await this.entityStoreGraphQLService.refreshCache();
  }
}
