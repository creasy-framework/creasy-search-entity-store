import { EntityStoreGraphQLResolverGenerator } from '../../src/graphql';
import { buildASTSchema, GraphQLObjectType } from 'graphql';
import '../gql.d.ts';
import gql from '../__fixtures/graphql/graphql-schema.gql';

describe('EntityStoreGraphQLResolverGenerator', () => {
  let entityRepository: any;
  let generator: any;
  let graphQLSchema;
  let userType: GraphQLObjectType;
  let organizationType: GraphQLObjectType;
  let groupType: GraphQLObjectType;
  let entityTypes;
  beforeEach(() => {
    entityRepository = {
      fetchById: jest.fn(),
      fetchByIds: jest.fn(),
      fetchByRefId: jest.fn(),
      insertEntity: jest.fn(),
      updateEntity: jest.fn(),
    };
    generator = new EntityStoreGraphQLResolverGenerator(entityRepository);
    graphQLSchema = buildASTSchema(gql);
    userType = graphQLSchema.getType('User') as GraphQLObjectType;
    organizationType = graphQLSchema.getType(
      'Organization',
    ) as GraphQLObjectType;
    groupType = graphQLSchema.getType('Group') as GraphQLObjectType;
    entityTypes = [userType, organizationType, groupType];
  });

  describe('getActualType', () => {
    it('should return correct type for array field', () => {
      const organization = userType.getFields()['organization'];
      expect(generator.getActualType(organization)).toBe('Organization');
    });
    it('should return correct type for normal field', () => {
      const userId = userType.getFields()['userId'];
      expect(generator.getActualType(userId)).toBe('String');
    });
  });

  it('getRefFields should return correct ref fields', () => {
    const refs = generator.getRefFields(userType, [userType, organizationType]);
    const [refA, refB] = refs;
    expect(refs.length).toEqual(2);
    expect(refA.name).toEqual('organization');
    expect(refA.type.toString()).toEqual('[Organization]');
    expect(refB.name).toEqual('supervisor');
    expect(refB.type.toString()).toEqual('User');
  });

  it('getDependentFields should return correct ref fields', () => {
    const dependents = generator.getDependentFields(organizationType, [
      userType,
      organizationType,
    ]);
    const [dependentA] = dependents;
    expect(dependents.length).toEqual(1);
    expect(dependentA.name).toEqual('User_by_organizationIds');
    expect(dependentA.type.toString()).toEqual('[User]');
  });

  describe('resolveEntity', () => {
    let refField;
    beforeEach(() => {
      refField = userType.getFields()['supervisor'];
      jest.spyOn(generator, 'createResolverForField');
    });

    it('should return null if entity id is null', async () => {
      const actual = await generator.resolveEntity(refField, entityTypes, {
        supervisorId: null,
      });
      expect(entityRepository.fetchById).not.toHaveBeenCalled();
      expect(actual).toBe(null);
    });
    it('should return null if the entity is not found', async () => {
      entityRepository.fetchById = jest
        .fn()
        .mockImplementation(() => Promise.resolve(null));
      const actual = await generator.resolveEntity(refField, entityTypes, {
        supervisorId: '1',
      });
      expect(entityRepository.fetchById).toHaveBeenCalledWith('User', '1');
      expect(actual).toBe(null);
    });
    it('should return properties and nested resolvers if entity is found', async () => {
      const fakeSupervisorEntity = {
        userId: '1',
        displayName: 'Fake user',
        titles: ['fake'],
        organizationIds: ['1', '2'],
        supervisorId: '2',
      };
      entityRepository.fetchById = jest
        .fn()
        .mockImplementation(() => Promise.resolve(fakeSupervisorEntity));
      const actual = await generator.resolveEntity(refField, entityTypes, {
        supervisorId: '1',
      });
      expect(entityRepository.fetchById).toHaveBeenCalledWith('User', '1');
      expect(generator.createResolverForField).toHaveBeenCalledWith(
        refField,
        entityTypes,
        fakeSupervisorEntity,
      );
      expect(actual).toMatchObject(fakeSupervisorEntity);
      expect(typeof actual['organization']).toBe('function');
      expect(typeof actual['supervisor']).toBe('function');
    });
  });

  describe('resolveEntityList', () => {
    let refField;
    beforeEach(() => {
      refField = userType.getFields()['organization'];
      jest.spyOn(generator, 'createResolverForEntityList');
    });
    it('should return null if entity ids is null', async () => {
      const actual = await generator.resolveEntityList(refField, entityTypes, {
        organizationIds: null,
      });
      expect(entityRepository.fetchByIds).not.toHaveBeenCalled();
      expect(actual).toBe(null);
    });
    it('should return null if entity ids is empty', async () => {
      const actual = await generator.resolveEntityList(refField, entityTypes, {
        organizationIds: [],
      });
      expect(entityRepository.fetchByIds).not.toHaveBeenCalled();
      expect(actual).toBe(null);
    });
    it('should return null if the entities is empty', async () => {
      entityRepository.fetchByIds = jest
        .fn()
        .mockImplementation(() => Promise.resolve([]));
      const actual = await generator.resolveEntityList(refField, entityTypes, {
        organizationIds: ['1', '2'],
      });
      expect(entityRepository.fetchByIds).toHaveBeenCalledWith('Organization', [
        '1',
        '2',
      ]);
      expect(actual).toBe(null);
    });
    it('should call createResolverForEntityList is entities are found', async () => {
      const fakeUserEntity = {
        userId: '1',
        displayName: 'Fake user',
        titles: ['fake'],
        organizationIds: ['1', '2'],
        supervisorId: '2',
      };
      const fakeOrganizations = [
        {
          organizationId: '1',
          displayName: 'Fake org 1',
        },
        {
          organizationId: '2',
          displayName: 'Fake org 2',
        },
      ];
      entityRepository.fetchByIds = jest
        .fn()
        .mockImplementation(() => Promise.resolve(fakeOrganizations));
      await generator.resolveEntityList(refField, entityTypes, fakeUserEntity);
      expect(entityRepository.fetchByIds).toHaveBeenCalledWith('Organization', [
        '1',
        '2',
      ]);
      expect(generator.createResolverForEntityList).toHaveBeenCalledWith(
        refField,
        entityTypes,
        fakeOrganizations,
      );
    });
  });

  describe('createResolverForEntityList', () => {
    let field;
    const fakeOrganizations = [
      {
        organizationId: '1',
        displayName: 'Fake org 1',
        groupId: '1',
      },
      {
        organizationId: '2',
        displayName: 'Fake org 2',
        groupId: '2',
      },
    ];
    beforeEach(() => {
      field = userType.getFields()['organization'];
      jest.spyOn(generator, 'getRefFields');
    });
    it('should return null if entities is empty', () => {
      expect(
        generator.createResolverForEntityList(field, entityTypes, []),
      ).toBe(null);
    });
    it('should return resolvers', () => {
      const actual = generator.createResolverForEntityList(
        field,
        entityTypes,
        fakeOrganizations,
      );
      expect(generator.getRefFields).toHaveBeenCalledWith(
        organizationType,
        entityTypes,
      );
      expect(actual.length).toBe(2);
      expect(actual[0]).toMatchObject(fakeOrganizations[0]);
      expect(actual[1]).toMatchObject(fakeOrganizations[1]);
      expect(typeof actual[0]['group']).toBe('function');
      expect(typeof actual[1]['group']).toBe('function');
    });
  });

  describe('createResolverForField', () => {
    let organizationField;
    let supervisorField;
    const parent = {};
    beforeEach(() => {
      organizationField = userType.getFields()['organization'];
      supervisorField = userType.getFields()['supervisor'];
      jest.spyOn(generator, 'resolveEntity');
      jest.spyOn(generator, 'resolveEntityList');
    });
    it('the createdResolver should call resolveEntity for non-array field', async () => {
      await generator.createResolverForField(
        supervisorField,
        entityTypes,
        parent,
      )();
      expect(generator.resolveEntity).toHaveBeenCalledWith(
        supervisorField,
        entityTypes,
        parent,
      );
    });
    it('the createdResolver should call resolveEntityList for array field', async () => {
      await generator.createResolverForField(
        organizationField,
        entityTypes,
        parent,
      )();
      expect(generator.resolveEntityList).toHaveBeenCalledWith(
        organizationField,
        entityTypes,
        parent,
      );
    });
  });

  describe('createResolverForDependent', () => {
    let dependentField;
    const fakeUserEntities = [
      {
        userId: '1',
        displayName: 'Fake user 1',
      },
      {
        userId: '2',
        displayName: 'Fake user 2',
      },
    ];
    beforeEach(async () => {
      jest.spyOn(generator, 'createResolverForEntityList');
      dependentField = userType.getFields()['User_by_supervisorId'];
      entityRepository.fetchByRefId = jest
        .fn()
        .mockImplementation(() => Promise.resolve(fakeUserEntities));
      await generator.createResolverForDependent(
        dependentField,
        entityTypes,
        '1',
      )();
    });
    it('should call fetchByRefId with correct arguments', () => {
      expect(entityRepository.fetchByRefId).toHaveBeenCalledWith(
        'User',
        'supervisorId',
        '1',
      );
    });
    it('should call createResolverForEntityList with correct arguments', () => {
      expect(generator.createResolverForEntityList).toHaveBeenCalledWith(
        dependentField,
        entityTypes,
        fakeUserEntities,
      );
    });
  });

  describe('createResolverForType', () => {
    let resolver;
    const fakeUserEntity = {
      userId: '1',
      displayName: 'Fake user',
      titles: ['fake'],
      organizationIds: ['1', '2'],
      supervisorId: '2',
    };
    beforeEach(() => {
      jest.spyOn(generator, 'getRefFields');
      jest.spyOn(generator, 'getDependentFields');
      resolver = generator.createResolverForType(userType, entityTypes);
    });

    it('should return null if can not get id from args', async () => {
      const actual = await resolver({});
      expect(actual).toBe(null);
    });

    it('should return null if can not find entity by id', async () => {
      entityRepository.fetchById = jest
        .fn()
        .mockImplementation(() => Promise.resolve(null));
      const actual = await resolver({ userId: '1' });
      expect(entityRepository.fetchById).toHaveBeenCalledWith('User', '1');
      expect(actual).toBe(null);
    });

    it('should return properties and nested resolvers and dependent resolvers if entity is found', async () => {
      entityRepository.fetchById = jest
        .fn()
        .mockImplementation(() => Promise.resolve(fakeUserEntity));
      const actual = await resolver({ userId: '1' });
      expect(entityRepository.fetchById).toHaveBeenCalledWith('User', '1');
      expect(actual).toMatchObject(fakeUserEntity);
      expect(typeof actual['organization']).toBe('function');
      expect(typeof actual['supervisor']).toBe('function');
      expect(typeof actual['User_by_supervisorId']).toBe('function');
    });
  });

  it('generate should return resolvers for all given entity types', () => {
    const actual = generator.generate(entityTypes);
    expect(typeof actual['user']).toBe('function');
    expect(typeof actual['organization']).toBe('function');
    expect(typeof actual['group']).toBe('function');
  });
});
