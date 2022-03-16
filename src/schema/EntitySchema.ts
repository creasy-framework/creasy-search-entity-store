import camelCase from 'camelcase';
import { EntitySchemaField } from './EntitySchemaField';
import { EntityJSONSchema, EntityJSONSchemaField } from './Types';
import { EntitySchemaDocument } from './EntitySchemaDocument';

export class EntitySchema {
  private readonly entityType: string;
  private readonly entitySchema: EntityJSONSchema;
  private readonly createdAt: number;
  private readonly version: number;
  private readonly fingerprint: string;
  private readonly fields: EntitySchemaField[];

  static generateFingerprint(entitySchema: EntityJSONSchema): string {
    return Buffer.from(JSON.stringify(entitySchema)).toString('base64');
  }

  static fromJson(json: EntitySchemaDocument): EntitySchema {
    const { entityType, entitySchema, version, fingerprint } = json;
    return new EntitySchema(
      entityType,
      entitySchema,
      Date.now(),
      version,
      fingerprint,
    );
  }

  constructor(
    entityType: string,
    entitySchema: EntityJSONSchema,
    createdAt: number,
    version: number,
    fingerprint?: string,
  ) {
    this.entityType = entityType;
    this.entitySchema = entitySchema;
    this.createdAt = createdAt;
    this.version = version;
    this.fields = this.createEntityFields();
    this.fingerprint =
      fingerprint || EntitySchema.generateFingerprint(entitySchema);
  }

  private createEntityFields() {
    return Object.entries(this.entitySchema.properties).map(
      ([name, metadata]) =>
        new EntitySchemaField(name, metadata as EntityJSONSchemaField),
    );
  }

  getCreatedAt(): number {
    return this.createdAt;
  }

  getEntityType(): string {
    return this.entityType;
  }

  getFields() {
    return this.fields;
  }

  getField(fieldName: string): EntitySchemaField {
    return this.fields.find((field) => field.getName() === fieldName);
  }

  getFingerprint(): string {
    return this.fingerprint;
  }

  getVersion(): number {
    return this.version;
  }

  getEntitySchema(): EntityJSONSchema {
    return this.entitySchema;
  }

  getIdField(): string {
    return this.entitySchema.idField || `${camelCase(this.getEntityType())}Id`;
  }

  toJson() {
    return {
      entityType: this.getEntityType(),
      entitySchema: this.getEntitySchema(),
      version: this.getVersion(),
      fingerprint: this.getFingerprint(),
      createdAt: this.getCreatedAt(),
    };
  }
}
