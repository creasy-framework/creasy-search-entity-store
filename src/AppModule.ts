import { Module } from '@nestjs/common';
import { EntitySchemaRegistryModule } from './schema';

@Module({
  imports: [EntitySchemaRegistryModule],
})
export class AppModule {}
