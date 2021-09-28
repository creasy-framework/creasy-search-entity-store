import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityStoreService } from './EntityStoreService';
import { ENTITY_UPDATE_EVENT, EventService } from '../event';

@Controller('entity-store')
export class EntityStoreController {
  constructor(
    private readonly entityStoreService: EntityStoreService,
    private readonly eventService: EventService,
  ) {}

  @Post(':type')
  async createEntity(
    @Param('type') entityType: string,
    @Query('async') async: boolean,
    @Body()
    entity: any,
    @Res() response: Response,
  ): Promise<void> {
    if (async) {
      await this.eventService.emit(ENTITY_UPDATE_EVENT, {
        key: entityType,
        value: JSON.stringify(entity),
      });
    } else {
      await this.entityStoreService.saveEntity(entity, entityType);
    }
    response.status(HttpStatus.ACCEPTED).send();
  }
}
