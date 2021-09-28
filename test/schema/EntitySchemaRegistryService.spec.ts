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
import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import { EntitySchemaNotFoundException } from '../../src/schema/exceptions/EntitySchemaNotFoundException';
import { EventModule, EventService } from '../../src/event';
import { EntitySchemaRegisterFailedException } from '../../src/schema/exceptions/EntitySchemaRegisterFailedException';

describe('EntitySchemaRegistryService', () => {
  let validator: EntitySchemaValidator;
  let repository: EntitySchemaRegistryRepository;
  let service: EntitySchemaRegistryService;
  let eventService: EventService;

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
        EventModule,
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
    eventService = moduleRef.get<EventService>(EventService);
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
      jest
        .spyOn(eventService, 'emit')
        .mockImplementation(() => Promise.resolve());
    });
    it('do nothing if find duplicated schema', async () => {
      jest
        .spyOn(repository, 'getSchemaByFingerprint')
        .mockImplementation(() => Promise.resolve(entitySchema));
      jest.spyOn(repository, 'saveSchema');
      await service.register('User', entitySchema as EntityJSONSchema);
      expect(repository.saveSchema).not.toHaveBeenCalled();
      expect(eventService.emit).not.toHaveBeenCalled();
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
      expect(eventService.emit).toHaveBeenCalled();
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
      expect(eventService.emit).toHaveBeenCalled();
    });
    it('revert schema if exception is threw', async () => {
      jest
        .spyOn(repository, 'getSchemaByFingerprint')
        .mockImplementation(() => Promise.resolve(null));
      jest
        .spyOn(repository, 'getLatestSchema')
        .mockImplementation(() => Promise.resolve(entitySchema));
      jest
        .spyOn(repository, 'deleteSchema')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(eventService, 'emit')
        .mockImplementation(() => Promise.reject());
      await expect(
        async () =>
          await service.register('User', userSchema as EntityJSONSchema),
      ).rejects.toThrow(EntitySchemaRegisterFailedException);
      expect(repository.deleteSchema).toHaveBeenCalled();
    });
  });
});
