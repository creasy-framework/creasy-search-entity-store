import * as OS from 'os';
import { Injectable } from '@nestjs/common';
import { EntitySchema } from '../schema';
import { EntityStoreGraphQLSchemaCustomType } from './EntityStoreGraphQLSchemaCustomType';
import { EntityStoreGraphQLSchemaRelationalField } from './EntityStoreGraphQLSchemaTypeField';
import { EntityStoreGraphQLSchemaQueryType } from './EntityStoreGraphQLSchemaQueryType';

@Injectable()
export class EntityStoreGraphQLSchemaGenerator {
  private getGraphQLTypeMap(entitySchemas: EntitySchema[]) {
    return entitySchemas.reduce((map, schema) => {
      const type = new EntityStoreGraphQLSchemaCustomType(schema);

      return {
        ...map,
        [schema.getEntityType()]: type,
      };
    }, {});
  }

  private getGraphQLRelationalFieldMap(entitySchemas: EntitySchema[]) {
    return entitySchemas.reduce((map, schema) => {
      return schema
        .getFields()
        .filter((f) => f.isRefField())
        .reduce((newMap, f) => {
          const relationalFields = newMap[f.getRefEntityType()] || [];
          return {
            ...newMap,
            [f.getRefEntityType()]: [
              ...relationalFields,
              new EntityStoreGraphQLSchemaRelationalField(
                schema.getEntityType(),
                f,
              ),
            ],
          };
        }, map);
    }, {});
  }

  generate(entitySchemas: EntitySchema[]): string {
    const queryType = new EntityStoreGraphQLSchemaQueryType(entitySchemas);
    const typeMap = this.getGraphQLTypeMap(entitySchemas);

    const relationalFieldMap = this.getGraphQLRelationalFieldMap(entitySchemas);
    Object.entries(relationalFieldMap).forEach(([key, fields]) => {
      const type = typeMap[key];
      if (type) {
        type.addRelationalFields(fields);
      }
    });

    const schemaAsString = Object.values(typeMap).reduce(
      (acc, type) => `${acc}${type.toString()}${OS.EOL}`,
      `${queryType.toString()}${OS.EOL}`,
    );
    return schemaAsString as string;
  }
}
