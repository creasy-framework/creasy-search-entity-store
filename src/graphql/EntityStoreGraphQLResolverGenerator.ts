import { Injectable } from '@nestjs/common';
import { GraphQLField, GraphQLObjectType, GraphQLList } from 'graphql';
import { EntityStoreRepository } from '../store';
import { DEPENDENT_FIELD_SEPARATOR } from './Constants';
import { EntityResolver } from './Types';

@Injectable()
export class EntityStoreGraphQLResolverGenerator {
  constructor(private entityRepository: EntityStoreRepository) {}
  private getActualType(field: GraphQLField<any, any>) {
    return field.type.toString().replace('[', '').replace(']', '');
  }

  private async resolveEntityList(
    refField: GraphQLField<any, any>,
    entityTypes: GraphQLObjectType[],
    parent: any,
  ) {
    const ids = parent[`${refField.name}Ids`];
    if (!ids || ids.length === 0) return null;
    const entities = await this.entityRepository.fetchByIds(
      this.getActualType(refField),
      ids,
    );
    return this.createResolverForEntityList(refField, entityTypes, entities);
  }

  private async resolveEntity(
    refField: GraphQLField<any, any>,
    entityTypes: GraphQLObjectType[],
    parent: any,
  ) {
    const entityType = entityTypes.find(
      (t) => t.name === this.getActualType(refField),
    );
    const refs = this.getRefFields(entityType, entityTypes);
    const id = parent[`${refField.name}Id`];
    if (!id) return null;
    const entity = await this.entityRepository.fetchById(
      this.getActualType(refField),
      id,
    );
    if (!entity) return null;
    const nestedResolvers = refs.reduce((next, ref) => {
      return {
        ...next,
        [ref.name]: this.createResolverForField(ref, entityTypes, entity),
      };
    }, {});
    return {
      ...entity,
      ...nestedResolvers,
    };
  }

  private getRefFields(
    entityType: GraphQLObjectType,
    entityTypes: GraphQLObjectType[],
  ): GraphQLField<any, any>[] {
    return Object.values(entityType.getFields()).filter(
      (field) =>
        field.name.indexOf(DEPENDENT_FIELD_SEPARATOR) === -1 &&
        entityTypes.some((type) => type.name == this.getActualType(field)),
    );
  }

  private getDependentFields(
    entityType: GraphQLObjectType,
    entityTypes: GraphQLObjectType[],
  ): GraphQLField<any, any>[] {
    return Object.values(entityType.getFields()).filter(
      (field) =>
        field.name.indexOf(DEPENDENT_FIELD_SEPARATOR) !== -1 &&
        entityTypes.some((type) => type.name == this.getActualType(field)),
    );
  }

  private createResolverForEntityList(
    field: GraphQLField<any, any>,
    entityTypes: GraphQLObjectType[],
    entities: any[],
  ) {
    if (!entities || entities.length === 0) return null;
    const entityType = entityTypes.find(
      (t) => t.name === this.getActualType(field),
    );
    const refs = this.getRefFields(entityType, entityTypes);
    return entities.map((entity) => {
      const nestedResolvers = refs.reduce((next, ref) => {
        return {
          ...next,
          [ref.name]: this.createResolverForField(ref, entityTypes, entity),
        };
      }, {});
      return {
        ...entity,
        ...nestedResolvers,
      };
    });
  }

  private createResolverForField(
    refField: GraphQLField<any, any>,
    entityTypes: GraphQLObjectType[],
    parent: any,
  ) {
    const resolver = async () => {
      const isArrayField = refField.type instanceof GraphQLList;
      if (isArrayField) {
        return await this.resolveEntityList(refField, entityTypes, parent);
      } else {
        return await this.resolveEntity(refField, entityTypes, parent);
      }
    };
    return resolver;
  }

  private createResolverForDependent(
    dependentField: GraphQLField<any, any>,
    entityTypes: GraphQLObjectType[],
    refId: string | number,
  ) {
    const resolver = async () => {
      const [dependentType, refFieldName] = dependentField.name.split(
        DEPENDENT_FIELD_SEPARATOR,
      );
      const entities = await this.entityRepository.fetchByRefId(
        dependentType,
        refFieldName,
        refId,
      );
      return this.createResolverForEntityList(
        dependentField,
        entityTypes,
        entities,
      );
    };
    return resolver;
  }

  private createResolverForType(
    entityType: GraphQLObjectType,
    entityTypes: GraphQLObjectType[],
  ) {
    const resolver = async (args: any) => {
      const entityIdField = `${entityType.name.toLowerCase()}Id`;
      const id = args[entityIdField];
      if (!id) return null;
      const entity = await this.entityRepository.fetchById(entityType.name, id);
      if (!entity) return null;
      const refs = this.getRefFields(entityType, entityTypes);
      const dependents = this.getDependentFields(entityType, entityTypes);
      const nestedResolvers = refs.reduce((next, ref) => {
        return {
          ...next,
          [ref.name]: this.createResolverForField(ref, entityTypes, entity),
        };
      }, {});
      const dependentResolvers = dependents.reduce((next, dependent) => {
        return {
          ...next,
          [dependent.name]: this.createResolverForDependent(
            dependent,
            entityTypes,
            id,
          ),
        };
      }, {});
      return {
        ...entity,
        ...nestedResolvers,
        ...dependentResolvers,
      };
    };

    return resolver;
  }

  generate = (entityTypes: GraphQLObjectType[]): EntityResolver => {
    const root = entityTypes.reduce((next, current) => {
      const resolver = this.createResolverForType(current, entityTypes);
      return { [current.name.toLowerCase()]: resolver, ...next };
    }, {});
    return root;
  };
}
