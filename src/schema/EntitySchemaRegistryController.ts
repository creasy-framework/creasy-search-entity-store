import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { EntitySchemaRegistryService } from './EntitySchemaRegistryService';
import { EntityJSONSchema } from './Types';
import { EntitySchema } from './EntitySchema';

@Controller('entity-schema-registry')
export class EntitySchemaRegistryController {
  constructor(private readonly service: EntitySchemaRegistryService) {}
  @Get(':type')
  async fetch(
    @Param('type') entityType: string,
    @Query('version') version: number,
    @Res() response: Response,
  ): Promise<void> {
    const entitySchema = await this.service.fetch(entityType, version);
    response.status(HttpStatus.OK).json(entitySchema.toJson());
  }

  @Get()
  async list(@Res() response: Response): Promise<void> {
    const entitySchemas: EntitySchema[] = await this.service.fetchAllLatest();
    response
      .status(HttpStatus.OK)
      .json(entitySchemas.map((schema) => schema.toJson()));
  }

  @Post(':type')
  async register(
    @Param('type') entityType: string,
    @Body() entitySchema: EntityJSONSchema,
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    const correlationId: string = request.headers['x-correlation-id'] as string;
    await this.service.register(entityType, entitySchema, correlationId);
    response.status(HttpStatus.CREATED).send();
  }
}
