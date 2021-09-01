import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EntityJSONSchema } from './Types';

@Schema({ collection: 'entity-schema' })
export class EntitySchemaDocument {
  @Prop()
  entityType: string;
  @Prop({ type: Object })
  entitySchema: EntityJSONSchema;
  @Prop()
  createdAt: number;
  @Prop()
  version: number;
  @Prop()
  fingerprint: string;

  constructor(
    entityType: string,
    entitySchema: EntityJSONSchema,
    createdAt: number,
    version: number,
    fingerprint: string,
  ) {
    this.entityType = entityType;
    this.entitySchema = entitySchema;
    this.createdAt = createdAt;
    this.version = version;
    this.fingerprint = fingerprint;
  }
}

export const EntitySchemaDocumentSchema =
  SchemaFactory.createForClass(EntitySchemaDocument);
