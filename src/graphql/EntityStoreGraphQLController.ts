import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { EntityStoreGraphQLService } from './EntityStoreGraphQLService';
import { PlainBody } from './PlainBodyDecorator';

@Controller('graphql')
export class EntityStoreGraphQLController {
  constructor(private readonly service: EntityStoreGraphQLService) {}
  @Post()
  async execute(
    @PlainBody() query: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.service.execute(query);
    response.json(result);
  }

  @Get('schema')
  async schema(@Res() response: Response): Promise<void> {
    const result = await this.service.getSchema();
    response.send(result);
  }
}
