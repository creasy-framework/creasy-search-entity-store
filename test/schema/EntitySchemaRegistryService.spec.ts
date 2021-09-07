import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EntitySchemaRegistryRepository,
  EntitySchemaValidator,
  EntitySchemaRegistryService,
  EntitySchemaDocument,
  EntitySchemaDocumentSchema,
  EntityJSONSchema,
} from '../../src/schema';
import { TestMongooseModule } from '../__utilities/TestMongooseModule';
import userSchema from '../__fixtures/user-schema.json';
import { EntitySchemaNotFoundException } from '../../src/schema/exceptions/EntitySchemaNotFoundException';

describe('EntitySchemaRegistryService', () => {
  let validator: EntitySchemaValidator;
  let repository: EntitySchemaRegistryRepository;
  let service: EntitySchemaRegistryService;

  const entitySchema = new EntitySchemaDocument(
    'User',
    userSchema as EntityJSONSchema,
    1123,
    1,
    'fingerprint',
  );

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TestMongooseModule,
        MongooseModule.forFeature([
          {
            name: EntitySchemaDocument.name,
            schema: EntitySchemaDocumentSchema,
          },
        ]),
      ],
      providers: [
        EntitySchemaRegistryRepository,
        EntitySchemaValidator,
        EntitySchemaRegistryService,
      ],
    }).compile();

    validator = moduleRef.get<EntitySchemaValidator>(EntitySchemaValidator);
    repository = moduleRef.get<EntitySchemaRegistryRepository>(
      EntitySchemaRegistryRepository,
    );
    service = moduleRef.get<EntitySchemaRegistryService>(
      EntitySchemaRegistryService,
    );
  });

  describe('fetch', () => {
    it('returns latest schema if no version provided', async () => {
      jest
        .spyOn(repository, 'getLatestSchema')
        .mockImplementation(() => Promise.resolve(entitySchema));
      await service.fetch('User');
      expect(repository.getLatestSchema).toHaveBeenCalledWith('User');
    });
    it('returns specific version schema if version is provided', async () => {
      jest
        .spyOn(repository, 'getSchema')
        .mockImplementation(() => Promise.resolve(entitySchema));
      await service.fetch('User', 2);
      expect(repository.getSchema).toHaveBeenCalledWith('User', 2);
    });
    it('throw EntitySchemaNotFoundException exception if no schema found', async () => {
      jest
        .spyOn(repository, 'getSchema')
        .mockImplementation(() => Promise.resolve(null));
      try {
        await service.fetch('User', 2);
      } catch (e) {
        expect(e instanceof EntitySchemaNotFoundException).toBe(true);
        expect((e as EntitySchemaNotFoundException).errorContext).toEqual({
          entityType: 'User',
          version: 2,
        });
      }
    });
  });

  describe('register', () => {
    beforeEach(() => {
      jest.spyOn(validator, 'validate').mockImplementation();
      jest.spyOn(repository, 'saveSchema').mockImplementation();
    });
    it('do nothing if find duplicated schema', async () => {
      jest
        .spyOn(repository, 'getSchemaByFingerprint')
        .mockImplementation(() => Promise.resolve(entitySchema));
      jest.spyOn(repository, 'saveSchema');
      await service.register('User', entitySchema as EntityJSONSchema);
      expect(repository.saveSchema).not.toHaveBeenCalled();
    });
    it('register new schema with version 1', async () => {
      jest
        .spyOn(repository, 'getSchemaByFingerprint')
        .mockImplementation(() => Promise.resolve(null));
      jest
        .spyOn(repository, 'getLatestSchema')
        .mockImplementation(() => Promise.resolve(null));
      await service.register('User', userSchema as EntityJSONSchema);
      expect(repository.saveSchema).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'User',
          entitySchema: userSchema,
          version: 1,
        }),
      );
    });
    it('register updated schema with increased version', async () => {
      jest
        .spyOn(repository, 'getSchemaByFingerprint')
        .mockImplementation(() => Promise.resolve(null));
      jest
        .spyOn(repository, 'getLatestSchema')
        .mockImplementation(() => Promise.resolve(entitySchema));
      await service.register('User', userSchema as EntityJSONSchema);
      expect(repository.saveSchema).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'User',
          entitySchema: userSchema,
          version: 2,
        }),
      );
    });
  });
});