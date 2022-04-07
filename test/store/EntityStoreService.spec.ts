import { EntityStoreService } from '../../src/store/EntityStoreService';
import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import { EntityJSONSchema, EntitySchema } from '../../src/schema';
import { ENTITY_CHANGED_EVENT } from '../../src/event';

describe('EntityStoreService', () => {
  let entityStoreService;
  let entityStoreRepository;
  let existing;
  let eventService;

  const entitySchema = EntitySchema.fromJson({
    entityType: 'User',
    entitySchema: userSchema as EntityJSONSchema,
    version: 1,
    createdAt: Date.now(),
    fingerprint: '',
  });

  const entity = { id: '1' };

  beforeEach(() => {
    entityStoreRepository = {
      insertEntity: jest.fn(),
      updateEntity: jest.fn(),
      deleteEntity: jest.fn(),
      fetchById: jest.fn().mockImplementation(() => existing),
      getModelMeta: jest.fn().mockImplementation(() => ({
        entitySchema,
        model: {},
      })),
      updateIndex: jest.fn(),
      refreshCache: jest.fn(),
    };
    eventService = {
      emit: jest.fn(),
    };
    entityStoreService = new EntityStoreService(
      entityStoreRepository,
      eventService,
    );
  });

  describe('saveEntity', () => {
    it('saveEntity should call insertEntity if no entity found', async () => {
      existing = null;
      await entityStoreService.saveEntity(entity, 'User');
      expect(entityStoreRepository.insertEntity).toHaveBeenCalledWith(
        'User',
        entity,
      );
      expect(eventService.emit).toHaveBeenCalledWith(ENTITY_CHANGED_EVENT, {
        key: 'User',
        value:
          '{"data":{"entityType":"User","id":"1","mutationType":"upsert"}}',
      });
    });

    it('saveEntity should call updateEntity if any entity found', async () => {
      existing = entity;
      await entityStoreService.saveEntity(entity, 'User');
      expect(entityStoreRepository.updateEntity).toHaveBeenCalledWith(
        'User',
        '1',
        entity,
      );
      expect(eventService.emit).toHaveBeenCalledWith(ENTITY_CHANGED_EVENT, {
        key: 'User',
        value:
          '{"data":{"entityType":"User","id":"1","mutationType":"upsert"}}',
      });
    });

    it('saveEntity should not call updateEntity and insertEntity if entity id is invalid', async () => {
      existing = entity;
      await entityStoreService.saveEntity({}, 'User');
      expect(entityStoreRepository.updateEntity).not.toHaveBeenCalled();
      expect(entityStoreRepository.insertEntity).not.toHaveBeenCalled();
    });
  });

  describe('deleteEntity', () => {
    it('deleteEntity should call deleteEntity and emit event', async () => {
      existing = null;
      await entityStoreService.deleteEntity('1', 'User');
      expect(entityStoreRepository.deleteEntity).toHaveBeenCalledWith(
        'User',
        '1',
      );
      expect(eventService.emit).toHaveBeenCalledWith(ENTITY_CHANGED_EVENT, {
        key: 'User',
        value:
          '{"data":{"entityType":"User","id":"1","mutationType":"remove"}}',
      });
    });
  });

  it('refreshStore should update model cache and indexes', async () => {
    await entityStoreService.refreshStore('User');
    expect(entityStoreRepository.refreshCache).toHaveBeenCalledWith('User');
    expect(entityStoreRepository.updateIndex).toHaveBeenCalledWith('User');
  });
});
