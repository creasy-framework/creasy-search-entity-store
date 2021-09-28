import { ERROR_SCHEMA_NOT_FOUND } from '../Constants';
import { ResourceNotFoundError } from '../../common';

export interface EntitySchemaNotFoundExceptionContext {
  entityType: string;
  version?: number;
}

export class EntitySchemaNotFoundException extends ResourceNotFoundError<EntitySchemaNotFoundExceptionContext> {
  constructor(context: EntitySchemaNotFoundExceptionContext) {
    super();
    this.errorCode = ERROR_SCHEMA_NOT_FOUND;
    this.context = context;
  }
}
