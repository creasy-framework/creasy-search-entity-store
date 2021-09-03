import * as OS from 'os';
import { GRAPHQL_SCHEMA_FIELD_INDENT } from './Constants';
import { EntitySchema } from '../schema';
import {
  EntityStoreGraphQLSchemaQueryField,
  EntityStoreGraphQLSchemaRefField,
} from './EntityStoreGraphQLSchemaTypeField';

export class EntityStoreGraphQLSchemaQueryType {
  private fields: EntityStoreGraphQLSchemaRefField[];

  constructor(schemas: EntitySchema[]) {
    this.fields = schemas.map((schema) => {
      const idField = schema
        .getFields()
        .find((f) => f.getName() === schema.getIdField());
      return new EntityStoreGraphQLSchemaQueryField(
        schema.getEntityType(),
        idField,
      );
    });
  }

  toString() {
    const fieldLines = this.fields.reduce((acc, field) => {
      return `${acc}${OS.EOL}${GRAPHQL_SCHEMA_FIELD_INDENT}${field.toString()}`;
    }, '');

    return `type Query {${fieldLines}${OS.EOL}}`;
  }
}
