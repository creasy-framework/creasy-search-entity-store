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
  User(userId: Integer): User
  Organization(organizationId: Integer): Organization
}
type User {
  userId: Integer
  displayName: String
  titles: [String]
  reportToUser(reportToUserId: Integer): User
  organization(organizationIds: [Integer]): [Organization]
  User_by_reportToUserId(reportToUserId: Integer): [User]
}
type Organization {
  organizationId: Integer
  displayName: String
  User_by_organizationIds(organizationIds: [Integer]): [User]
}
`;
    expect(
      schemaGenerator.generate([userEntitySchema, orgEntitySchema]),
    ).toEqual(expected);
  });
});
