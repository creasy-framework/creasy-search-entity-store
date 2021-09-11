import { Injectable } from '@nestjs/common';
import { EntityPropertyValidationInterceptor } from './EntityPropertyValidationInterceptor';
import { EntitySchema } from '../EntitySchema';

@Injectable()
export class EntitySchemaValidator {
  validate(entitySchema: EntitySchema) {
    [new EntityPropertyValidationInterceptor()].forEach((interceptor) =>
      interceptor.validate(entitySchema),
    );
  }
}
