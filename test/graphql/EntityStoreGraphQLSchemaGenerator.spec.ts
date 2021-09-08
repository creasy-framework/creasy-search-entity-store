import { EntityStoreGraphQLSchemaGenerator } from '../../src/graphql';
import { EntityJSONSchema, EntitySchema } from '../../src/schema';
import userSchema from '../__fixtures/user-schema.json';
import orgSchema from '../__fixtures/organization-schema.json';

describe('EntityStoreGraphQLSchemaGenerator', () => {
  const schemaGenerator = new EntityStoreGraphQLSchemaGenerator();

  const userEntitySchema = new EntitySchema(
    'User',
    userSchema as EntityJSONSchema,
    Date.now(),
    1,
  );

  const orgEntitySchema = new EntitySchema(
    'Organization',
    orgSchema as EntityJSONSchema,
    Date.now(),
    1,
  );

  it('should generate graphql schema', () => {
    const expected = `type Query {
  user(userId: String): User
  organization(organizationId: String): Organization
}
type User {
  userId: String
  displayName: String
  titles: [String]
  reportToUser: User
  organization: [Organization]
  User_by_reportToUserId: [User]
}
type Organization {
  organizationId: String
  displayName: String
  User_by_organizationIds: [User]
}
`;
    expect(
      schemaGenerator.generate([userEntitySchema, orgEntitySchema]),
    ).toEqual(expected);
  });
});
