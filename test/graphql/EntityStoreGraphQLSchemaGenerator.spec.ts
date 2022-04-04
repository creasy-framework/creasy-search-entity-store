import { EntityStoreGraphQLSchemaGenerator } from '../../src/graphql';
import { EntityJSONSchema, EntitySchema } from '../../src/schema';
import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import orgSchema from '../__fixtures/entity-schemas/organization-schema.json';

describe('EntityStoreGraphQLSchemaGenerator', () => {
  const schemaGenerator = new EntityStoreGraphQLSchemaGenerator();

  const userEntitySchema = new EntitySchema(
    'User',
    userSchema as EntityJSONSchema,
    Date.now(),
    2,
  );

  const orgEntitySchema = new EntitySchema(
    'Organization',
    orgSchema as EntityJSONSchema,
    Date.now(),
    1,
  );

  it('should generate graphql schema', () => {
    const expected = `# Version: 1-2
type Query {
  user(id: String): User
  userList(ids: [String]): [User]
  organization(id: String): Organization
  organizationList(ids: [String]): [Organization]
}
type User {
  id: String
  displayName: String
  titles: [String]
  reportToUser: User
  organization: [Organization]
  User_by_reportToUserId: [User]
}
type Organization {
  id: String
  displayName: String
  User_by_organizationIds: [User]
}
`;
    expect(
      schemaGenerator.generate([userEntitySchema, orgEntitySchema]),
    ).toEqual(expected);
  });
});
