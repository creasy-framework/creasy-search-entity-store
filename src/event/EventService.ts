import { Inject, Injectable } from '@nestjs/common';
import { KafkaService } from '@rob3000/nestjs-kafka';
import { Message } from 'kafkajs';
import { ENTITY_SCHEMA_EVENTS } from './Constants';

export interface EventMessage extends Message {
  value: any | Buffer | string | null;
  key?: any;
}

@Injectable()
export class EventService {
  constructor(
    @Inject('ENTITY_EVENT_CLIENT') private entityEventClient: KafkaService,
    @Inject('ENTITY_SCHEMA_EVENT_CLIENT')
    private entitySchemaEventClient: KafkaService,
  ) {}

  private client(topic: string) {
    return ENTITY_SCHEMA_EVENTS.includes(topic)
      ? this.entitySchemaEventClient
      : this.entityEventClient;
  }

  async emit(topic: string, messages: EventMessage[]): Promise<void> {
    await this.client(topic).send({
      key: topic,
      topic: topic,
      messages: messages,
    } as any);
  }

  subscribe(topic: string, instance: any) {
    this.client(topic).subscribeToResponseOf(topic, instance);
  }
}
