import { EntityJSONSchemaPrimitiveType, EntitySchemaField } from '../schema';

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
    const argumentType = this.mapPrimitiveType(this.entitySchemaField.getType());
    return `${this.entityType}(${argumentName}: ${argumentType}): ${this.entityType}`;
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
    const mappedType = this.mapPrimitiveType(this.entitySchemaField.getType());
    const refType = this.entitySchemaField.getRefEntityType();
    const argumentType = isArray ? `[${mappedType}]` : mappedType;
    const returnType = isArray ? `[${refType}]` : refType;
    const name = isArray
      ? argumentName.substr(0, argumentName.length - 3)
      : argumentName.substr(0, argumentName.length - 2);
    return `${name}(${argumentName}: ${argumentType}): ${returnType}`;
  }
}

export class EntityStoreGraphQLSchemaRelationalField extends EntityStoreGraphQLSchemaTypeField {
  private readonly entityType: string;
  constructor(entityType: string, field: EntitySchemaField) {
    super(field);
    this.entityType = entityType;
  }

  toString() {
    const isArray = this.entitySchemaField.isArrayField();
    const name = this.entitySchemaField.getName();
    const mappedType = this.mapPrimitiveType(this.entitySchemaField.getType());
    const argumentType = isArray ? `[${mappedType}]` : mappedType;
    return `${this.entityType}_by_${name}(${name}: ${argumentType}): [${this.entityType}]`;
  }
}
