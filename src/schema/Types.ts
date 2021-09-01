import { EntitySchema } from './EntitySchema';
import { JSONSchema7 } from 'json-schema';

export type EntityJSONSchema = JSONSchema7 & {
  idField?: string;
};

export type EntityJSONSchemaField = JSONSchema7 & {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array';
  refType?: string;
  items?: EntityJSONSchemaField;
};

export interface EntitySchemaValidationInterceptor {
  validate: (entitySchema: EntitySchema) => void;
}
