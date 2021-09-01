import { HttpStatus } from '@nestjs/common';

export interface InvalidSchemaExceptionContext {
  propertyName?: string;
  propertyType?: string;
}

export class InvalidSchemaException extends Error {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly errorContext: InvalidSchemaExceptionContext;
  constructor(errorCode: string, context: InvalidSchemaExceptionContext) {
    super();
    this.errorCode = errorCode;
    this.errorContext = context;
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}
