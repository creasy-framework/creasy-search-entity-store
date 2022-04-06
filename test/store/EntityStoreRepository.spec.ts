import { Test } from '@nestjs/testing';
import { CACHE_MANAGER, CacheModule } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { TestMongooseModule } from '../__utilities/TestMongooseModule';
import { EntityStoreRepository } from '../../src/store';
import { EntitySchemaMapper } from '../../src/store/EntitySchemaMapper';
import {
  EntityJSONSchema,
  EntitySchema,
  EntitySchemaRegistryModule,
  EntitySchemaRegistryRepository,
} from '../../src/schema';
import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import { LATEST_ENTITY_SCHEMA_VERSION_CACHE_KEY } from '../../src/store/Constants';

describe('EntityStoreRepository', () => {
  let repository;
  let mapper;
  let cacheManager;
  let entitySchemaRegistryRepository;
  let connection;
  let mockCollection;
  let mockCreateIndex;
  const latestSchemaVersion = 2;
  const schemaDoc = {
    entityType: 'User',
    createdAt: Date.now(),
    entitySchema: userSchema as EntityJSONSchema,
    version: latestSchemaVersion,
    fingerprint: '',
  };
  const entity1 = { userId: '1' };
  const entity2 = { userId: '2' };
  const mockModel = {
    create: jest.fn(),
    updateOne: jest.fn(),
    findOne: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ _doc: entity1 })),
    find: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([{ _doc: { userId: '1' } }, { _doc: entity2 }]),
      ),
    fetchByRefId: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([{ _doc: { userId: '1' } }, { _doc: entity2 }]),
      ),
  };
  const mockDocSchema = {};
  beforeEach(async () => {
    mockCreateIndex = jest.fn();
    mockCollection = jest.fn().mockImplementation(() => ({
      createIndex: mockCreateIndex,
    }));
    connection = {
      model: jest.fn(),
      db: {
        collection: mockCollection,
      },
    };
    const moduleRef = await Test.createTestingModule({
      imports: [
        TestMongooseModule,
        MongooseModule,
        CacheModule.register(),
        EntitySchemaRegistryModule,
      ],
      providers: [
        EntityStoreRepository,
        EntitySchemaMapper,
        {
          provide: getConnectionToken(),
          useValue: connection,
        },
      ],
    }).compile();

    repository = moduleRef.get<EntityStoreRepository>(EntityStoreRepository);
    mapper = moduleRef.get<EntitySchemaMapper>(EntitySchemaMapper);
    entitySchemaRegistryRepository =
      moduleRef.get<EntitySchemaRegistryRepository>(
        EntitySchemaRegistryRepository,
      );
    mapper = moduleRef.get<EntitySchemaMapper>(EntitySchemaMapper);
    cacheManager = moduleRef.get<Cache>(CACHE_MANAGER);
    jest.spyOn(mapper, 'map').mockImplementation(() => mockDocSchema);
    jest.spyOn(connection, 'model').mockImplementation(() => mockModel);
  });
  describe('refreshCache', () => {
    beforeEach(() => {
      jest
        .spyOn(cacheManager, 'del')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(cacheManager, 'set')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(entitySchemaRegistryRepository, 'getLatestSchema')
        .mockImplementation(() => Promise.resolve(schemaDoc));
    });
    it('refreshCache should reset cache with latest schema version', async () => {
      const { model, entitySchema } = await repository.refreshCache('User');
      expect(cacheManager.del).toHaveBeenCalledWith(
        `${LATEST_ENTITY_SCHEMA_VERSION_CACHE_KEY}_User`,
      );
      expect(
        entitySchemaRegistryRepository.getLatestSchema,
      ).toHaveBeenCalledWith('User');
      expect(cacheManager.set).toHaveBeenCalledWith(
        `${LATEST_ENTITY_SCHEMA_VERSION_CACHE_KEY}_User`,
        latestSchemaVersion,
      );
      expect(connection.model).toHaveBeenCalledWith(
        'User',
        mockDocSchema,
        'ENTITY_USER',
      );
      expect(model).toBe(mockModel);
      expect(entitySchema.getEntityType()).toBe('User');
      expect(entitySchema.getVersion()).toBe(latestSchemaVersion);
      expect(entitySchema.getEntitySchema()).toEqual(userSchema);
      expect((repository as any).modelMetaMap.get('User').entitySchema).toEqual(
        entitySchema,
      );
      expect((repository as any).modelMetaMap.get('User').model).toEqual(
        mockModel,
      );
    });
  });

  describe('getModelMeta', () => {
    const entitySchema = EntitySchema.fromJson(schemaDoc);

    beforeEach(() => {
      (repository as any).modelMetaMap.set('User', {
        entitySchema,
        model: mockModel,
      });

      jest
        .spyOn(repository, 'refreshCache')
        .mockImplementation(() => Promise.resolve());
    });

    it('should call refreshCache when no cached data in memory', async () => {
      (repository as any).modelMetaMap.clear();
      jest
        .spyOn(repository, 'refreshCache')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(cacheManager, 'get').mockImplementation(() => 2);
      await repository.getModelMeta('User');
      expect(repository.refreshCache).toHaveBeenCalledWith('User');
    });

    it('should call refreshCache when schema version is not matched', async () => {
      jest.spyOn(cacheManager, 'get').mockImplementation(() => 3);
      await repository.getModelMeta('User');
      expect(repository.refreshCache).toHaveBeenCalledWith('User');
    });

    it('should not call refreshCache when schema version is matched', async () => {
      jest.spyOn(cacheManager, 'get').mockImplementation(() => 2);
      await repository.getModelMeta('User');
      expect(repository.refreshCache).not.toHaveBeenCalledWith('User');
    });
  });

  describe('updateIndex', () => {
    const entitySchema = EntitySchema.fromJson(schemaDoc);

    beforeEach(() => {
      jest.spyOn(repository, 'getModelMeta').mockImplementation(() =>
        Promise.resolve({
          entitySchema,
          model: mockModel,
        }),
      );
      repository.updateIndex('User');
    });

    it('should create index for entity id field', async () => {
      expect(mockCollection).toHaveBeenCalledWith(`ENTITY_USER`);
      expect(mockCreateIndex).toHaveBeenCalledWith({
        [entitySchema.getIdField()]: 1,
      });
    });

    it('should create index for ref field', async () => {
      expect(mockCollection).toHaveBeenCalledWith(`ENTITY_USER`);
      expect(mockCreateIndex).toHaveBeenCalledWith({
        reportToUserId: 1,
      });
      expect(mockCreateIndex).toHaveBeenCalledWith({
        organizationIds: 1,
      });
    });
  });

  describe('CURD api', () => {
    const entitySchema = EntitySchema.fromJson(schemaDoc);

    beforeEach(() => {
      jest.spyOn(repository, 'getModelMeta').mockImplementation(() =>
        Promise.resolve({
          entitySchema,
          model: mockModel,
        }),
      );
    });
    it('insertEntity should create entity in DB', async () => {
      const doc = {};
      await repository.insertEntity('User', doc);
      expect(repository.getModelMeta).toHaveBeenCalledWith('User');
      expect(mockModel.create).toHaveBeenCalledWith(doc);
    });
    it('updateEntity should update entity with right filter', async () => {
      const doc = { id: '1' };
      await repository.updateEntity('User', '1', doc);
      expect(repository.getModelMeta).toHaveBeenCalledWith('User');
      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { id: '1' },
        { $set: doc },
      );
    });
    it('deleteEntity should mark entity as deleted', async () => {
      await repository.deleteEntity('User', '1');
      expect(repository.getModelMeta).toHaveBeenCalledWith('User');
      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { id: '1' },
        { $set: { __isDeleted: true } },
      );
    });
    it('fetchById should find entity with right filter', async () => {
      const entity = await repository.fetchById('User', '1');
      expect(repository.getModelMeta).toHaveBeenCalledWith('User');
      expect(mockModel.findOne).toHaveBeenCalledWith({
        id: '1',
        __isDeleted: false,
      });
      expect(entity).toEqual(entity1);
    });
    it('fetchByIds should find entities with right filter', async () => {
      const entities = await repository.fetchByIds('User', ['1', '2']);
      expect(repository.getModelMeta).toHaveBeenCalledWith('User');
      expect(mockModel.find).toHaveBeenCalledWith({
        id: { $in: ['1', '2'] },
        __isDeleted: false,
      });
      expect(entities).toEqual([entity1, entity2]);
    });
    it('fetchByRefId should find entities with right filter', async () => {
      const entities = await repository.fetchByRefId(
        'User',
        'organizationIds',
        '2',
      );
      expect(repository.getModelMeta).toHaveBeenCalledWith('User');
      expect(mockModel.find).toHaveBeenCalledWith({
        organizationIds: '2',
        __isDeleted: false,
      });
      expect(entities).toEqual([entity1, entity2]);
    });
  });
});
