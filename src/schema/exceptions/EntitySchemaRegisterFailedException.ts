import { ERROR_SCHEMA_REGISTER_FAILED } from '../Constants';
import { UnexpectedError } from '../../common';

export class EntitySchemaRegisterFailedException extends UnexpectedError<undefined> {
  readonly errorCode: string;
  constructor() {
    super();
    this.errorCode = ERROR_SCHEMA_REGISTER_FAILED;
  }
}
