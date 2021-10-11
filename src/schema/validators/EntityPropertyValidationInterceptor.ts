import { EntitySchema } from '../EntitySchema';
import { InvalidSchemaException } from '../exceptions/InvalidSchemaException';
import {
  ERROR_INVALID_SCHEMA_MISSING_PROPERTIES,
  ERROR_INVALID_SCHEMA_INVALID_PROPERTY_TYPE,
  ERROR_INVALID_SCHEMA_INVALID_PROPERTY_NAME,
  ERROR_INVALID_SCHEMA_MISSING_ENTITY_ID_FIELD,
} from '../Constants';
import {
  EntitySchemaValidationInterceptor,
  EntityJSONSchemaField,
} from '../Types';

export class EntityPropertyValidationInterceptor
  implements EntitySchemaValidationInterceptor
{
  validate(schema: EntitySchema): void {
    const entitySchema = schema.getEntitySchema();
    const { properties } = entitySchema;
    if (
      !properties ||
      typeof properties !== 'object' ||
      properties instanceof Array
    ) {
      throw new InvalidSchemaException(
        ERROR_INVALID_SCHEMA_MISSING_PROPERTIES,
        {},
      );
    }
    if (!properties[schema.getIdField()]) {
      throw new InvalidSchemaException(
        ERROR_INVALID_SCHEMA_MISSING_ENTITY_ID_FIELD,
        { propertyName: schema.getIdField() },
      );
    }
    Object.entries(properties).forEach(([name, property]) => {
      const propertyType = (property as EntityJSONSchemaField).type;
      if (
        !['string', 'boolean', 'number', 'integer', 'array'].includes(
          propertyType,
        )
      ) {
        throw new InvalidSchemaException(
          ERROR_INVALID_SCHEMA_INVALID_PROPERTY_TYPE,
          { propertyType, propertyName: name },
        );
      }
      if (name.indexOf('_') != -1) {
        throw new InvalidSchemaException(
          ERROR_INVALID_SCHEMA_INVALID_PROPERTY_NAME,
          {
            propertyType,
            propertyName: name,
          },
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
          {
            propertyType,
            propertyName: name,
          },
        );
      }
    });
  }
}
