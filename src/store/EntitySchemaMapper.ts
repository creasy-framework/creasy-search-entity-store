import { Injectable } from '@nestjs/common';
import { EntitySchema, EntitySchemaField } from '../schema';
import { Schema, SchemaDefinition, SchemaDefinitionType } from 'mongoose';
import { InvalidFieldTypeException } from './exceptions/InvalidFieldTypeException';
import { ENTITY_SCHEMA_TYPE_MAP } from './Constants';

@Injectable()
export class EntitySchemaMapper {
  map(entitySchema: EntitySchema) {
    return new Schema(
      entitySchema.getFields().reduce(
        (definition: SchemaDefinition<SchemaDefinitionType<any>>, field) => {
          return {
            ...definition,
            [field.getName()]: {
              type: this.mapType(field),
              default: undefined,
            },
          };
        },
        {
          __isDeleted: {
            type: Schema.Types.Boolean,
            default: false,
          },
        },
      ),
    );
  }

  private mapType(field: EntitySchemaField) {
    const type = ENTITY_SCHEMA_TYPE_MAP[field.getType()];
    if (!type) {
      throw new InvalidFieldTypeException({
        propertyName: field.getName(),
        propertyType: field.getType(),
      });
    }
    if (field.isArrayField()) {
      return [type];
    }
    return type;
  }
}
