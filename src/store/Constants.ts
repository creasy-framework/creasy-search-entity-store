import { Schema } from 'mongoose';

export const ERROR_INVALID_ENTITY_FIELD_TYPE_ERROR =
  'ERROR_INVALID_ENTITY_FIELD_TYPE_ERROR';

export const ENTITY_SCHEMA_TYPE_MAP = {
  string: Schema.Types.String,
  boolean: Schema.Types.Boolean,
  long: Schema.Types.Number,
  integer: Schema.Types.Number,
  float: Schema.Types.Number,
  date: Schema.Types.Date,
};

export const LATEST_ENTITY_SCHEMA_VERSION_CACHE_KEY =
  'LATEST_ENTITY_SCHEMA_VERSION_';

export enum ENTITY_MUTATION_TYPE {
  UPSERT = 'upsert',
  REMOVE = 'remove',
}
