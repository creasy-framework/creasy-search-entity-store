import { EntityJSONSchemaField, EntityJSONSchemaPrimitiveType } from './Types';

export class EntitySchemaField implements EntitySchemaField {
  private readonly name: string;
  private readonly metadata: EntityJSONSchemaField;
  constructor(name: string, metadata: EntityJSONSchemaField) {
    this.name = name;
    this.metadata = metadata;
  }

  getName(): string {
    return this.name;
  }

  getType(): EntityJSONSchemaPrimitiveType {
    if (this.isArrayField()) {
      return this.metadata.items.type as EntityJSONSchemaPrimitiveType;
    }
    return this.metadata.type;
  }

  isArrayField(): boolean {
    return (
      this.metadata.type.toLocaleLowerCase() === 'array' &&
      !!this.metadata.items
    );
  }

  isRefField(): boolean {
    if (this.isArrayField()) {
      return !!this.metadata.items.refType;
    }
    return !!this.metadata.refType;
  }

  getRefEntityType(): string | null {
    if (this.isRefField()) {
      if (this.isArrayField()) {
        return this.metadata.items.refType;
      }
      return this.metadata.refType;
    }
    return null;
  }

  equalsTo(field: EntitySchemaField): boolean {
    if (this === field) return true;
    if (
      field instanceof EntitySchemaField &&
      this.name === field.getName() &&
      JSON.stringify(this.metadata) === JSON.stringify(field.metadata)
    ) {
      return true;
    }
    return false;
  }
}
