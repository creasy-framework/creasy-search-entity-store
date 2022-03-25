import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import {
  EntitySchema,
  EntityJSONSchema,
} from '../../src/schema';

describe('EntitySchema', () => {
  const createdAt = Date.now();
  const jsonEntitySchema = new EntitySchema(
    'User',
    userSchema as EntityJSONSchema,
    createdAt,
    1,
  );
  it('getEntityType returns correct entity type', () => {
    expect(jsonEntitySchema.getEntityType()).toBe('User');
  });
  it('getVersion returns current version', () => {
    expect(jsonEntitySchema.getVersion()).toBe(1);
  });
  it('getCreatedAt returns correct creation time', () => {
    expect(jsonEntitySchema.getCreatedAt()).toBe(createdAt);
  });
});
