import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
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
    @Req() request: Request,
  ): Promise<void> {
    const correlationId: string = request.headers['x-correlation-id'] as string;
    if (async) {
      await this.eventService.emit(ENTITY_UPDATE_EVENT, {
        key: entityType,
        value: JSON.stringify({
          correlationId,
          data: entity,
        }),
      });
      response.status(HttpStatus.ACCEPTED).send();
    } else {
      await this.entityStoreService.saveEntity(
        entity,
        entityType,
        correlationId,
      );
      response.status(HttpStatus.OK).send();
    }
  }

  @Delete(':type/:entityId')
  async deleteEntity(
    @Param('type') entityType: string,
    @Param('entityId') entityId: string,
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    const correlationId: string = request.headers['x-correlation-id'] as string;
    await this.entityStoreService.deleteEntity(
      entityId,
      entityType,
      correlationId,
    );
    response.status(HttpStatus.OK).send();
  }
}
