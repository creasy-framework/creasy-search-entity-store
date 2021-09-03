import { HttpStatus } from '@nestjs/common';
import { ERROR_SCHEMA_NOT_FOUND } from '../Constants';

export interface EntitySchemaNotFoundExceptionContext {
  entityType: string;
  version?: number;
}

export class EntitySchemaNotFoundException extends Error {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly errorContext: EntitySchemaNotFoundExceptionContext;
  constructor(context: EntitySchemaNotFoundExceptionContext) {
    super();
    this.errorCode = ERROR_SCHEMA_NOT_FOUND;
    this.statusCode = HttpStatus.NOT_FOUND;
    this.errorContext = context;
  }
}
