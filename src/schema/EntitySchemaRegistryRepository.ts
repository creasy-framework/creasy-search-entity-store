import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { EntitySchemaDocument } from './EntitySchemaDocument';

@Injectable()
export class EntitySchemaRegistryRepository {
  constructor(
    @InjectModel(EntitySchemaDocument.name)
    private entitySchemaModel: Model<EntitySchemaDocument & Document>,
  ) {}

  async getSchemas(entityType: string): Promise<EntitySchemaDocument[]> {
    return this.entitySchemaModel.find({
      entityType,
    });
  }

  async getSchema(
    entityType: string,
    version: number,
  ): Promise<EntitySchemaDocument> {
    return this.entitySchemaModel.findOne({
      entityType,
      version,
    });
  }

  async getLatestSchema(entityType: string): Promise<EntitySchemaDocument> {
    const [entitySchema] = await this.entitySchemaModel
      .find({ entityType })
      .sort({ version: -1 })
      .limit(1);
    return entitySchema;
  }

  async getSchemaByFingerprint(
    fingerprint: string,
  ): Promise<EntitySchemaDocument> {
    return this.entitySchemaModel.findOne({
      fingerprint,
    });
  }

  async saveSchema(entitySchema: EntitySchemaDocument): Promise<void> {
    const model = new this.entitySchemaModel(entitySchema);
    await model.save();
  }

  async deleteSchema(entitySchema: EntitySchemaDocument): Promise<void> {
    await this.entitySchemaModel.deleteMany({
      entityType: entitySchema.entityType,
      version: entitySchema.version,
    });
  }
}
