import {
  EntityStoreGraphQLSchemaRelationalField,
  EntityStoreGraphQLSchemaPrimitiveField,
  EntityStoreGraphQLSchemaRefField,
  EntityStoreGraphQLSchemaQueryField,
} from '../../src/graphql';
import { EntitySchemaField } from '../../src/schema';

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
      const expected = 'author(authorId: String): User';
      expect(field.toString()).toBe(expected);
    });
    it('toString() should return correct query function for ref array', () => {
      const field = new EntityStoreGraphQLSchemaRefField(
        new EntitySchemaField('authorIds', {
          type: 'array',
          items: { type: 'string', refType: 'User' },
        }),
      );
      const expected = 'author(authorIds: [String]): [User]';
      expect(field.toString()).toBe(expected);
    });
  });
  describe('EntityStoreGraphQLSchemaRelationalField', () => {
    it('toString() should return correct query function for single ref field', () => {
      const field = new EntityStoreGraphQLSchemaRelationalField(
        'Book',
        new EntitySchemaField('authorId', { type: 'string', refType: 'User' }),
      );
      const expected = 'Book_by_authorId(authorId: String): [Book]';
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
      const expected = 'Book_by_authorIds(authorIds: [String]): [Book]';
      expect(field.toString()).toBe(expected);
    });
  });

  describe('EntityStoreGraphQLSchemaQueryField', () => {
    it('toString() should return correct query field', () => {
      const field = new EntityStoreGraphQLSchemaQueryField(
        'User',
        new EntitySchemaField('userId', { type: 'string' }),
      );
      const expected = 'User(userId: String): User';
      expect(field.toString()).toBe(expected);
    });
  });
});
