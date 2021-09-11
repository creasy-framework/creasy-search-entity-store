import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import {
  EntitySchema,
  EntitySchemaField,
  EntityJSONSchemaField,
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
  describe('getField', () => {
    it('returns json schema field', () => {
      const expected = new EntitySchemaField(
        'reportToUserId',
        userSchema.properties.reportToUserId as EntityJSONSchemaField,
      );
      expect(
        jsonEntitySchema.getField('reportToUserId').equalsTo(expected),
      ).toBe(true);
    });
    it("returns undefined if the field name doesn't exist", () => {
      expect(jsonEntitySchema.getField('invalid')).toBe(undefined);
    });
  });
  describe('getIdField', () => {
    it('returns default id field', () => {
      expect(jsonEntitySchema.getIdField()).toBe('userId');
    });
    it('returns specific id field in schema', () => {
      const schema = new EntitySchema(
        'User',
        {
          ...userSchema,
          idField: 'id',
        } as EntityJSONSchema,
        createdAt,
        1,
      );
      expect(schema.getIdField()).toBe('id');
    });
  });
});
