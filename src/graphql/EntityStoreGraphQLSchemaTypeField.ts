import camelCase from 'camelcase';
import { EntityJSONSchemaPrimitiveType, EntitySchemaField } from '../schema';
import {
  DEPENDENT_FIELD_SEPARATOR,
  GRAPHQL_SCHEMA_FIELD_INDENT,
} from './Constants';
import { EOL } from 'os';

export abstract class EntityStoreGraphQLSchemaTypeField {
  protected entitySchemaField: EntitySchemaField;
  constructor(field: EntitySchemaField) {
    this.entitySchemaField = field;
  }
  protected mapPrimitiveType(type: EntityJSONSchemaPrimitiveType) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export class EntityStoreGraphQLSchemaQueryField extends EntityStoreGraphQLSchemaTypeField {
  private readonly entityType: string;
  constructor(entityType: string, field: EntitySchemaField) {
    super(field);
    this.entityType = entityType;
  }
  toString() {
    const argumentName = this.entitySchemaField.getName();
    const argumentType = this.mapPrimitiveType(
      this.entitySchemaField.getType(),
    );
    const simpleQuery = `${camelCase(
      this.entityType,
    )}(${argumentName}: ${argumentType}): ${this.entityType}`;

    const batchQuery = `${camelCase(
      this.entityType,
    )}List(${argumentName}s: [${argumentType}]): [${this.entityType}]`;

    return `${simpleQuery}${EOL}${GRAPHQL_SCHEMA_FIELD_INDENT}${batchQuery}`;
  }
}

export class EntityStoreGraphQLSchemaPrimitiveField extends EntityStoreGraphQLSchemaTypeField {
  toString() {
    const name = this.entitySchemaField.getName();
    const isArray = this.entitySchemaField.isArrayField();
    const mappedType = this.mapPrimitiveType(this.entitySchemaField.getType());
    const type = isArray ? `[${mappedType}]` : mappedType;
    return `${name}: ${type}`;
  }
}

export class EntityStoreGraphQLSchemaRefField extends EntityStoreGraphQLSchemaTypeField {
  toString() {
    const argumentName = this.entitySchemaField.getName();
    const isArray = this.entitySchemaField.isArrayField();
    const refType = this.entitySchemaField.getRefEntityType();
    const returnType = isArray ? `[${refType}]` : refType;
    const name = isArray
      ? argumentName.substr(0, argumentName.length - 3)
      : argumentName.substr(0, argumentName.length - 2);
    return `${name}: ${returnType}`;
  }
}

export class EntityStoreGraphQLSchemaRelationalField extends EntityStoreGraphQLSchemaTypeField {
  private readonly entityType: string;
  constructor(entityType: string, field: EntitySchemaField) {
    super(field);
    this.entityType = entityType;
  }

  toString() {
    const name = this.entitySchemaField.getName();
    return `${this.entityType}${DEPENDENT_FIELD_SEPARATOR}${name}: [${this.entityType}]`;
  }
}
