import { Logger } from '@nestjs/common';
import { EntitySchema } from '../EntitySchema';
import { InvalidSchemaException } from '../exceptions/InvalidSchemaException';
import {
  ERROR_INVALID_SCHEMA_MISSING_PROPERTIES,
  ERROR_INVALID_SCHEMA_INVALID_PROPERTY_TYPE,
  ERROR_INVALID_SCHEMA_INVALID_PROPERTY_NAME,
} from '../Constants';
import {
  EntitySchemaValidationInterceptor,
  EntityJSONSchemaField,
} from '../Types';

export class EntityPropertyValidationInterceptor
  implements EntitySchemaValidationInterceptor
{
  private readonly logger = new Logger(
    EntityPropertyValidationInterceptor.name,
  );
  validate(schema: EntitySchema): void {
    const entitySchema = schema.getEntitySchema();
    const { properties } = entitySchema;
    if (!properties || typeof properties !== 'object') {
      this.logger.error(
        `"properties" is missing in ${schema.getEntityType()} schema`,
      );
      throw new InvalidSchemaException(
        ERROR_INVALID_SCHEMA_MISSING_PROPERTIES,
        {},
      );
    }
    Object.entries(properties).forEach(([name, property]) => {
      const propertyType = (property as EntityJSONSchemaField).type;
      if (
        !['string', 'boolean', 'number', 'integer', 'array'].includes(
          propertyType,
        )
      ) {
        this.logger.error(`property type "${propertyType}" is invalid`);
        throw new InvalidSchemaException(
          ERROR_INVALID_SCHEMA_INVALID_PROPERTY_TYPE,
          { propertyType, propertyName: name },
        );
      }
      const refType = (property as EntityJSONSchemaField).refType;
      if (!refType) return;
      if (
        (propertyType === 'array' && !name.endsWith('Ids')) ||
        !name.endsWith('Id')
      ) {
        throw new InvalidSchemaException(
          ERROR_INVALID_SCHEMA_INVALID_PROPERTY_NAME,
          { propertyType, propertyName: name },
        );
      }
    });
  }
}