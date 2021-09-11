import { Injectable } from '@nestjs/common';

const MockDataStorage = {
  User: [
    {
      userId: '1',
      displayName: 'User A',
      organizationIds: ['1', '2'],
      tags: ['S', 'B'],
    },
    {
      userId: '2',
      displayName: 'User B',
      organizationIds: ['3'],
      tags: ['S', 'B'],
      supervisorId: '1',
    },
  ],
  Organization: [
    {
      organizationId: '1',
      displayName: 'Org A',
      groupId: '1',
    },
    {
      organizationId: '2',
      displayName: 'Org B',
      groupId: '2',
    },
    {
      organizationId: '3',
      displayName: 'Org C',
      groupId: '1',
    },
  ],
  Group: [
    {
      groupId: '1',
      displayName: 'Group A',
    },
    {
      groupId: '2',
      displayName: 'Group B',
    },
  ],
};

@Injectable()
export class EntityStoreRepository {
  fetchById = (entityType: string, id: string | number): Promise<any> => {
    const data = MockDataStorage[entityType];
    const idField = `${
      entityType.charAt(0).toLowerCase() + entityType.slice(1)
    }Id`;
    return Promise.resolve(data.find((row) => row[idField] === id));
  };
  fetchByIds = (
    entityType: string,
    ids: string[] | number[],
  ): Promise<any[]> => {
    const data = MockDataStorage[entityType];
    const idField = `${
      entityType.charAt(0).toLowerCase() + entityType.slice(1)
    }Id`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Promise.resolve(data.filter((row) => ids.includes(row[idField])));
  };
  fetchByRefId = (
    entityType: string,
    refFieldName: string,
    refId: string | number,
  ): Promise<any[]> => {
    const data = MockDataStorage[entityType];
    return Promise.resolve(
      data.filter((row) => {
        if (row[refFieldName] instanceof Array) {
          return row[refFieldName].includes(refId);
        }
        return row[refFieldName] == refId;
      }),
    );
  };
}
