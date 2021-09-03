import * as OS from 'os';
import {
  FIELD_TYPE_SORT_PRIORITIES,
  GRAPHQL_SCHEMA_FIELD_INDENT,
} from './Constants';
import {
  EntityStoreGraphQLSchemaPrimitiveField,
  EntityStoreGraphQLSchemaRefField,
  EntityStoreGraphQLSchemaRelationalField,
  EntityStoreGraphQLSchemaTypeField,
} from './EntityStoreGraphQLSchemaTypeField';
import { EntitySchema, EntitySchemaField } from '../schema';

export class EntityStoreGraphQLSchemaCustomType {
  private readonly typeName: string;
  private fields: EntityStoreGraphQLSchemaTypeField[];

  constructor(entitySchema: EntitySchema) {
    this.typeName = entitySchema.getEntityType();
    this.fields = entitySchema
      .getFields()
      .map((f) => this.getSchemeTypeField(f));
  }

  private getSchemeTypeField(field: EntitySchemaField) {
    if (field.isRefField()) {
      return new EntityStoreGraphQLSchemaRefField(field);
    }
    return new EntityStoreGraphQLSchemaPrimitiveField(field);
  }

  private getSortedFields(): EntityStoreGraphQLSchemaTypeField[] {
    return this.fields.sort((a, b) => {
      const priorityA = FIELD_TYPE_SORT_PRIORITIES[a.constructor.name];
      const priorityB = FIELD_TYPE_SORT_PRIORITIES[b.constructor.name];
      return priorityA - priorityB;
    });
  }

  addRelationalFields(fields: EntityStoreGraphQLSchemaRelationalField[]): void {
    this.fields = [...this.fields, ...fields];
  }

  toString() {
    const fieldLines = this.getSortedFields().reduce(
      (acc, field) =>
        `${acc}${OS.EOL}${GRAPHQL_SCHEMA_FIELD_INDENT}${field.toString()}`,
      '',
    );
    return `type ${this.typeName} {${fieldLines}${OS.EOL}}`;
  }
}
