import {
  EntityStoreGraphQLSchemaRelationalField,
  EntityStoreGraphQLSchemaCustomType,
} from '../../src/graphql';
import { EntitySchema, EntitySchemaField } from '../../src/schema';

describe('EntityStoreGraphQLSchemaCustomType', () => {
  const schema: any = {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      addressId: { type: 'string', refType: 'Address' },
      collaboratorIds: {
        type: 'array',
        items: { type: 'string', refType: 'Collaborator' },
      },
    },
  };
  const userType = new EntityStoreGraphQLSchemaCustomType(
    EntitySchema.fromJson({
      entityType: 'User',
      version: 1,
      entitySchema: schema,
      createdAt: Date.now(),
      fingerprint: 'fingerprint',
    }),
  );
  const relationalField = new EntityStoreGraphQLSchemaRelationalField(
    'Book',
    new EntitySchemaField('authorId', {
      type: 'string',
      refType: 'User',
    }),
  );
  userType.addRelationalFields([relationalField]);
  it('toString should return graphql schema type', () => {
    expect(userType.toString()).toBe(`type User {
  userId: String
  tags: [String]
  address: Address
  collaborator: [Collaborator]
  Book_by_authorId(authorId: String): [Book]
}`);
  });
});
