import { Module } from '@nestjs/common';
import { EntityStoreRepository } from './EntityStoreRepository';
@Module({
  providers: [EntityStoreRepository],
  exports: [EntityStoreRepository],
})
export class EntityStoreModule {}
