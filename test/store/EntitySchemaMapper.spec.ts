import { EntitySchemaMapper } from '../../src/store/EntitySchemaMapper';
import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import { EntityJSONSchema, EntitySchema } from '../../src/schema';
import { Schema } from 'mongoose';

describe('EntitySchemaMapper', () => {
  const mapper = new EntitySchemaMapper();
  const entitySchema = EntitySchema.fromJson({
    entityType: 'User',
    entitySchema: userSchema as EntityJSONSchema,
    version: 1,
    createdAt: Date.now(),
    fingerprint: '',
  });
  it('should map correct field type', () => {
    const docSchema = mapper.map(entitySchema);
    expect(docSchema.obj.userId.type).toEqual(Schema.Types.String);
    expect(docSchema.obj.reportToUserId.type).toEqual(Schema.Types.String);
    expect(docSchema.obj.organizationIds.type).toEqual([Schema.Types.String]);
  });
});
