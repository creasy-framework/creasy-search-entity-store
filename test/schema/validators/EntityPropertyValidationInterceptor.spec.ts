import userSchema from '../../__fixtures/entity-schemas/user-schema.json';
import { EntityPropertyValidationInterceptor } from '../../../src/schema/validators/EntityPropertyValidationInterceptor';
import { EntityJSONSchema, EntitySchema } from '../../../src/schema';
import { InvalidSchemaException } from '../../../src/schema/exceptions/InvalidSchemaException';
import {
  ERROR_INVALID_SCHEMA_INVALID_PROPERTY_TYPE,
  ERROR_INVALID_SCHEMA_MISSING_PROPERTIES,
  ERROR_INVALID_SCHEMA_INVALID_PROPERTY_NAME,
  ERROR_INVALID_SCHEMA_MISSING_ENTITY_ID_FIELD,
} from '../../../src/schema/Constants';

describe('EntitySchemaValidationInterceptor', () => {
  const validator = new EntityPropertyValidationInterceptor();

  it('should not throw InvalidSchemaException exception if schema is valid', () => {
    const entitySchema = EntitySchema.fromJson({
      entityType: 'User',
      entitySchema: userSchema as EntityJSONSchema,
      version: 1,
      fingerprint: 'fingerprint',
      createdAt: Date.now(),
    });
    validator.validate(entitySchema);
  });
  it('should throw InvalidSchemaException exception if properties is invalid', () => {
    const entitySchema = EntitySchema.fromJson({
      entityType: 'User',
      entitySchema: { properties: [] } as any,
      version: 1,
      fingerprint: 'fingerprint',
      createdAt: Date.now(),
    });
    try {
      validator.validate(entitySchema);
    } catch (e) {
      expect(e instanceof InvalidSchemaException).toBe(true);
      expect((e as InvalidSchemaException).getErrorCode()).toBe(
        ERROR_INVALID_SCHEMA_MISSING_PROPERTIES,
      );
    }
  });
  it('should throw InvalidSchemaException exception if missing entity id field', () => {
    const entitySchema = EntitySchema.fromJson({
      entityType: 'User',
      entitySchema: { properties: { foo: { type: 'object' } } } as any,
      version: 1,
      fingerprint: 'fingerprint',
      createdAt: Date.now(),
    });
    try {
      validator.validate(entitySchema);
    } catch (e) {
      expect(e instanceof InvalidSchemaException).toBe(true);
      expect((e as InvalidSchemaException).getErrorCode()).toBe(
        ERROR_INVALID_SCHEMA_MISSING_ENTITY_ID_FIELD,
      );
      expect((e as InvalidSchemaException).getContext()).toEqual({
        propertyName: 'id',
      });
    }
  });
  it('should throw InvalidSchemaException exception if one of property type is invalid', () => {
    const entitySchema = EntitySchema.fromJson({
      entityType: 'User',
      entitySchema: {
        properties: { id: { type: 'string' }, foo: { type: 'object' } },
      } as any,
      version: 1,
      fingerprint: 'fingerprint',
      createdAt: Date.now(),
    });
    try {
      validator.validate(entitySchema);
    } catch (e) {
      expect(e instanceof InvalidSchemaException).toBe(true);
      expect((e as InvalidSchemaException).getErrorCode()).toBe(
        ERROR_INVALID_SCHEMA_INVALID_PROPERTY_TYPE,
      );
      expect((e as InvalidSchemaException).getContext()).toEqual({
        propertyName: 'foo',
        propertyType: 'object',
      });
    }
  });
  it('should throw InvalidSchemaException exception if one of property is a ref but property name is not end with Id', () => {
    const entitySchema = EntitySchema.fromJson({
      entityType: 'User',
      entitySchema: {
        properties: {
          id: { type: 'string' },
          org: { type: 'string', refType: 'Organization' },
        },
      } as any,
      version: 1,
      fingerprint: 'fingerprint',
      createdAt: Date.now(),
    });
    try {
      validator.validate(entitySchema);
    } catch (e) {
      expect(e instanceof InvalidSchemaException).toBe(true);
      expect((e as InvalidSchemaException).getErrorCode()).toBe(
        ERROR_INVALID_SCHEMA_INVALID_PROPERTY_NAME,
      );
      expect((e as InvalidSchemaException).getContext()).toEqual({
        propertyName: 'org',
        propertyType: 'string',
      });
    }
  });
  it('should throw InvalidSchemaException exception if one of property is a ref array but property name is not end with Ids', () => {
    const entitySchema = EntitySchema.fromJson({
      entityType: 'User',
      entitySchema: {
        properties: {
          id: { type: 'string' },
          org: {
            type: 'array',
            items: { type: 'string', refType: 'Organization' },
          },
        },
      } as any,
      version: 1,
      fingerprint: 'fingerprint',
      createdAt: Date.now(),
    });
    try {
      validator.validate(entitySchema);
    } catch (e) {
      expect(e instanceof InvalidSchemaException).toBe(true);
      expect((e as InvalidSchemaException).getErrorCode()).toBe(
        ERROR_INVALID_SCHEMA_INVALID_PROPERTY_NAME,
      );
      expect((e as InvalidSchemaException).getContext()).toEqual({
        propertyName: 'org',
        propertyType: 'string',
      });
    }
  });
});
