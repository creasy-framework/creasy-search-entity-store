import { RequestValidationError } from '../../common';

export interface InvalidSchemaExceptionContext {
  propertyName?: string;
  propertyType?: string;
}

export class InvalidSchemaException extends RequestValidationError<InvalidSchemaExceptionContext> {
  constructor(errorCode: string, context: InvalidSchemaExceptionContext) {
    super();
    this.errorCode = errorCode;
    this.context = context;
  }
}
