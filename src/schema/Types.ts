import { EntitySchema } from './EntitySchema';
import { JSONSchema7 } from 'json-schema';

export type EntityJSONSchema = JSONSchema7;

export type EntityJSONSchemaPrimitiveType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array';

export type EntityJSONSchemaField = JSONSchema7 & {
  type: EntityJSONSchemaPrimitiveType;
  refType?: string;
  items?: EntityJSONSchemaField;
};

export interface EntitySchemaValidationInterceptor {
  validate: (entitySchema: EntitySchema) => void;
}
