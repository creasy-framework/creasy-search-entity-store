import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import { EntityJSONSchemaField, EntitySchemaField } from '../../src/schema';

describe('EntitySchemaField', () => {
  const createTypeByFieldName = (fieldName: string) => {
    const { properties } = userSchema;
    return new EntitySchemaField(
      fieldName,
      properties[fieldName] as EntityJSONSchemaField,
    );
  };
  describe('primitive field', () => {
    const fieldName = 'userId';
    const primitiveField = createTypeByFieldName(fieldName);
    it('isArrayField returns false', () => {
      expect(primitiveField.isArrayField()).toBe(false);
    });
    it('isRefField returns false', () => {
      expect(primitiveField.isRefField()).toBe(false);
    });
    it('getName returns correct field name', () => {
      expect(primitiveField.getName()).toBe(fieldName);
    });
    it('getType returns correct field type', () => {
      expect(primitiveField.getType()).toBe('string');
    });
  });
  describe('ref field', () => {
    const fieldName = 'reportToUserId';
    const refField = createTypeByFieldName(fieldName);
    it('isArrayField returns true', () => {
      expect(refField.isArrayField()).toBe(false);
    });
    it('isRefField returns true', () => {
      expect(refField.isRefField()).toBe(true);
    });
    it('getName returns correct field name', () => {
      expect(refField.getName()).toBe(fieldName);
    });
    it('getType returns correct field type', () => {
      expect(refField.getType()).toBe('string');
    });
    it('getRefEntityType returns correct ref field entity type', () => {
      expect(refField.getRefEntityType()).toBe('User');
    });
  });
  describe('primitive array field', () => {
    const fieldName = 'titles';
    const primitiveArrayField = createTypeByFieldName(fieldName);
    it('isArrayField returns true', () => {
      expect(primitiveArrayField.isArrayField()).toBe(true);
    });
    it('isRefField returns false', () => {
      expect(primitiveArrayField.isRefField()).toBe(false);
    });
    it('getName returns correct field name', () => {
      expect(primitiveArrayField.getName()).toBe(fieldName);
    });
    it('getType returns correct field type', () => {
      expect(primitiveArrayField.getType()).toBe('string');
    });
  });
  describe('ref array field', () => {
    const fieldName = 'organizationIds';
    const refArrayField = createTypeByFieldName(fieldName);
    it('isArrayField returns true', () => {
      expect(refArrayField.isArrayField()).toBe(true);
    });
    it('isRefField returns true', () => {
      expect(refArrayField.isRefField()).toBe(true);
    });
    it('getName returns correct field name', () => {
      expect(refArrayField.getName()).toBe(fieldName);
    });
    it('getType returns correct field type', () => {
      expect(refArrayField.getType()).toBe('string');
    });
    it('getRefEntityType returns correct ref field entity type', () => {
      expect(refArrayField.getRefEntityType()).toBe('Organization');
    });
  });
});
