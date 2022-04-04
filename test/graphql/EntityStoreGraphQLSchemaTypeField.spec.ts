import {
  EntityStoreGraphQLSchemaRelationalField,
  EntityStoreGraphQLSchemaPrimitiveField,
  EntityStoreGraphQLSchemaRefField,
  EntityStoreGraphQLSchemaQueryField,
  GRAPHQL_SCHEMA_FIELD_INDENT,
} from '../../src/graphql';
import { EntitySchemaField } from '../../src/schema';
import { EOL } from 'os';

describe('EntityStoreGraphQLSchemaType', () => {
  describe('EntityStoreGraphQLSchemaPrimitiveField', () => {
    it('toString() should return correct primitive field for single data', () => {
      const field = new EntityStoreGraphQLSchemaPrimitiveField(
        new EntitySchemaField('username', { type: 'string' }),
      );
      const expected = 'username: String';
      expect(field.toString()).toBe(expected);
    });
    it('toString() should return correct primitive field for array', () => {
      const field = new EntityStoreGraphQLSchemaPrimitiveField(
        new EntitySchemaField('tags', {
          type: 'array',
          items: { type: 'string' },
        }),
      );
      const expected = 'tags: [String]';
      expect(field.toString()).toBe(expected);
    });
  });
  describe('EntityStoreGraphQLSchemaRefField', () => {
    it('toString() should return correct query function for single ref field', () => {
      const field = new EntityStoreGraphQLSchemaRefField(
        new EntitySchemaField('authorId', { type: 'string', refType: 'User' }),
      );
      const expected = 'author: User';
      expect(field.toString()).toBe(expected);
    });
    it('toString() should return correct query function for ref array', () => {
      const field = new EntityStoreGraphQLSchemaRefField(
        new EntitySchemaField('authorIds', {
          type: 'array',
          items: { type: 'string', refType: 'User' },
        }),
      );
      const expected = 'author: [User]';
      expect(field.toString()).toBe(expected);
    });
  });
  describe('EntityStoreGraphQLSchemaRelationalField', () => {
    it('toString() should return correct query function for single ref field', () => {
      const field = new EntityStoreGraphQLSchemaRelationalField(
        'Book',
        new EntitySchemaField('authorId', { type: 'string', refType: 'User' }),
      );
      const expected = 'Book_by_authorId: [Book]';
      expect(field.toString()).toBe(expected);
    });

    it('toString() should return correct query function for ref array', () => {
      const field = new EntityStoreGraphQLSchemaRelationalField(
        'Book',
        new EntitySchemaField('authorIds', {
          type: 'array',
          items: { type: 'string', refType: 'User' },
        }),
      );
      const expected = 'Book_by_authorIds: [Book]';
      expect(field.toString()).toBe(expected);
    });
  });

  describe('EntityStoreGraphQLSchemaQueryField', () => {
    it('toString() should return correct query field', () => {
      const field = new EntityStoreGraphQLSchemaQueryField(
        'User',
        new EntitySchemaField('id', { type: 'string' }),
      );
      const expected = `user(id: String): User${EOL}${GRAPHQL_SCHEMA_FIELD_INDENT}userList(ids: [String]): [User]`;
      expect(field.toString()).toBe(expected);
    });
  });
});
