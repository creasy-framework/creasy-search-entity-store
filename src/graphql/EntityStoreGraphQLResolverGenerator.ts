import { Injectable, Logger } from '@nestjs/common';
import { EntitySchema, EntitySchemaField } from '../schema';
import { EntityStoreRepository } from '../store';

export interface EntityResolver {
  [key: string]: (args: any) => Promise<any>;
}

@Injectable()
export class EntityStoreGraphQLResolverGenerator {
  constructor(private entityRepository: EntityStoreRepository) {}

  private getPropertyKeyFromField(ref: EntitySchemaField) {
    return ref.isArrayField()
      ? ref.getName().substr(0, ref.getName().length - 3)
      : ref.getName().substr(0, ref.getName().length - 2);
  }

  private createResolverForField(
    refField: EntitySchemaField,
    schemas: EntitySchema[],
    primaryEntity: any,
  ) {
    const resolver = async () => {
      const schema = schemas.find(
        (s) => s.getEntityType() === refField.getRefEntityType(),
      );
      const refs = schema.getFields().filter((f) => f.isRefField());
      const id = primaryEntity[refField.getName()];
      if (!id) return null;
      if (refField.isArrayField()) {
        const entities = await this.entityRepository.fetchByIds(
          refField.getRefEntityType(),
          id,
        );
        if (entities.length === 0) return null;
        return entities.map((entity) => {
          const nestedResolvers = refs.reduce((next, ref) => {
            return {
              ...next,
              [this.getPropertyKeyFromField(ref)]: this.createResolverForField(
                ref,
                schemas,
                entity,
              ),
            };
          }, {});
          return {
            ...entity,
            ...nestedResolvers,
          };
        });
      } else {
        const entity = await this.entityRepository.fetchById(
          refField.getRefEntityType(),
          id,
        );
        const nestedResolvers = refs.reduce((next, ref) => {
          return {
            ...next,
            [this.getPropertyKeyFromField(ref)]: this.createResolverForField(
              ref,
              schemas,
              entity,
            ),
          };
        }, {});
        return {
          ...entity,
          ...nestedResolvers,
        };
      }
    };
    return resolver;
  }

  private createResolverForSchema(
    schema: EntitySchema,
    entitySchemas: EntitySchema[],
  ) {
    const resolver = async (args: any) => {
      const id = args[schema.getIdField()];
      const primaryEntity = await this.entityRepository.fetchById(
        schema.getEntityType(),
        id,
      );
      if (!primaryEntity) return null;
      const refs = schema.getFields().filter((f) => f.isRefField());
      const nestedResolvers = refs.reduce((next, ref) => {
        return {
          ...next,
          [this.getPropertyKeyFromField(ref)]: this.createResolverForField(
            ref,
            entitySchemas,
            primaryEntity,
          ),
        };
      }, {});
      return {
        ...primaryEntity,
        ...nestedResolvers,
      };
    };

    return resolver;
  }

  generate = (entitySchemas: EntitySchema[]): EntityResolver => {
    const root = entitySchemas.reduce((next, current) => {
      const resolver = this.createResolverForSchema(current, entitySchemas);
      return { [current.getEntityType().toLowerCase()]: resolver, ...next };
    }, {});
    return root;
  };
}
