import { Module } from '@nestjs/common';
import { KafkaModule } from '@rob3000/nestjs-kafka';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventService } from './EventService';
@Module({
  imports: [
    KafkaModule.registerAsync(['ENTITY_EVENT_CLIENT'], {
      useFactory: async (configService: ConfigService) => {
        const brokers = configService.get<string>('KAFKA_BROKERS').split(',');
        return [
          {
            name: 'ENTITY_EVENT_CLIENT',
            options: {
              client: {
                brokers: brokers,
              },
              consumer: {
                groupId: 'entity-event-consumer',
                allowAutoTopicCreation: true,
              },
              producer: {
                allowAutoTopicCreation: true,
              },
            },
          },
        ];
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
