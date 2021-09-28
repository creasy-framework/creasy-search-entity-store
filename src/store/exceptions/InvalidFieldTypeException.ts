import { ERROR_INVALID_ENTITY_FIELD_TYPE_ERROR } from '../Constants';
import { RequestValidationError } from '../../common';

export interface InvalidFieldTypeExceptionContext {
  propertyName?: string;
  propertyType?: string;
}

export class InvalidFieldTypeException extends RequestValidationError<InvalidFieldTypeExceptionContext> {
  constructor(context: InvalidFieldTypeExceptionContext) {
    super();
    this.errorCode = ERROR_INVALID_ENTITY_FIELD_TYPE_ERROR;
    this.context = context;
  }
}
