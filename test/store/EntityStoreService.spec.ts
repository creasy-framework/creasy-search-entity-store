import { EntityStoreService } from '../../src/store/EntityStoreService';
import userSchema from '../__fixtures/entity-schemas/user-schema.json';
import { EntityJSONSchema, EntitySchema } from '../../src/schema';
import { ENTITY_PUBLISHED_EVENT_SUFFIX } from '../../src/event';

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

  const entity = { userId: '1' };

  beforeEach(() => {
    entityStoreRepository = {
      insertEntity: jest.fn(),
      updateEntity: jest.fn(),
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
      expect(eventService.emit).toHaveBeenCalledWith(
        `User${ENTITY_PUBLISHED_EVENT_SUFFIX}`,
        { key: 'User', value: '1' },
      );
    });

    it('saveEntity should call updateEntity if any entity found', async () => {
      existing = entity;
      await entityStoreService.saveEntity(entity, 'User');
      expect(entityStoreRepository.updateEntity).toHaveBeenCalledWith(
        'User',
        '1',
        entity,
      );
      expect(eventService.emit).toHaveBeenCalledWith(
        `User${ENTITY_PUBLISHED_EVENT_SUFFIX}`,
        { key: 'User', value: '1' },
      );
    });

    it('saveEntity should not call updateEntity and insertEntity if entity id is invalid', async () => {
      existing = entity;
      await entityStoreService.saveEntity({}, 'User');
      expect(entityStoreRepository.updateEntity).not.toHaveBeenCalled();
      expect(entityStoreRepository.insertEntity).not.toHaveBeenCalled();
    });
  });

  it('refreshStore should update model cache and indexes', async () => {
    await entityStoreService.refreshStore('User');
    expect(entityStoreRepository.refreshCache).toHaveBeenCalledWith('User');
    expect(entityStoreRepository.updateIndex).toHaveBeenCalledWith('User');
  });
});