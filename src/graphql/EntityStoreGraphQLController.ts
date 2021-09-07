import { Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { EntityStoreGraphQLService } from './EntityStoreGraphQLService';
import { PlainBody } from '../decorators';

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
}
