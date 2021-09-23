import { Inject, Injectable } from '@nestjs/common';
import { KafkaService } from '@rob3000/nestjs-kafka';
import { Message } from 'kafkajs';

export interface EventMessage extends Message {
  value: any | Buffer | string | null;
  key?: any;
}

@Injectable()
export class EventService {
  constructor(@Inject('ENTITY_EVENT_CLIENT') private client: KafkaService) {}

  async emit(topic: string, messages: EventMessage[]): Promise<void> {
    await this.client.send({
      key: topic,
      topic: topic,
      messages: messages,
    } as any);
  }

  subscribe(topic: string, instance: any) {
    this.client.subscribeToResponseOf(topic, instance);
  }
}
