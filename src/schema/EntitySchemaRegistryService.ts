import { Injectable } from '@nestjs/common';
import { EntitySchema } from './EntitySchema';
import { EntitySchemaRegistryRepository } from './EntitySchemaRegistryRepository';
import { EntitySchemaValidator } from './validators/EntitySchemaValidator';
import { EntitySchemaNotFoundException } from './exceptions/EntitySchemaNotFoundException';
import { EntityJSONSchema } from './Types';
import { ENTITY_SCHEMA_UPDATED, EventService } from '../event';

@Injectable()
export class EntitySchemaRegistryService {
  constructor(
    private entitySchemaRepository: EntitySchemaRegistryRepository,
    private validator: EntitySchemaValidator,
    private eventService: EventService,
  ) {}

  async fetch(entityType: string, version?: number): Promise<EntitySchema> {
    let entitySchema;
    if (version) {
      entitySchema = await this.entitySchemaRepository.getSchema(
        entityType,
        version,
      );
    } else {
      entitySchema = await this.entitySchemaRepository.getLatestSchema(
        entityType,
      );
    }
    if (!entitySchema) {
      throw new EntitySchemaNotFoundException({ entityType, version });
    }
    return EntitySchema.fromJson(entitySchema);
  }

  async register(entityType: string, schema: EntityJSONSchema): Promise<void> {
    const fingerprint = EntitySchema.generateFingerprint(schema);
    const existingSchema =
      await this.entitySchemaRepository.getSchemaByFingerprint(fingerprint);

    if (existingSchema) {
      return;
    }

    const latestVersion = await this.getLatestSchemaVersion(entityType);
    const nextVersion = latestVersion + 1;
    const entitySchema = new EntitySchema(
      entityType,
      schema,
      Date.now(),
      nextVersion,
      fingerprint,
    );

    this.validator.validate(entitySchema);
    await this.entitySchemaRepository.saveSchema(entitySchema.toJson());
    await this.eventService.emit(ENTITY_SCHEMA_UPDATED, [
      { value: JSON.stringify(entitySchema.toJson()) },
    ]);
  }

  private async getLatestSchemaVersion(entityType: string) {
    const existingSchema = await this.entitySchemaRepository.getLatestSchema(
      entityType,
    );
    if (!existingSchema) {
      return 0;
    }

    return existingSchema.version;
  }
}
