import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, SUBSCRIBER_MAP } from '@rob3000/nestjs-kafka';
import { Message } from 'kafkajs';
import { FAILED_TO_PROCEED_EVENT } from './Constants';

export interface EventMessage extends Message {
  value: any | Buffer | string | null;
  key?: any;
  correlationId?: string;
}

@Injectable()
export class EventService implements OnModuleInit {
  private eventSubscriberMap = new Map();
  constructor(@Inject('ENTITY_EVENT_CLIENT') private client: KafkaService) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async emit(event: string, message: EventMessage): Promise<void> {
    Logger.log(`Emitting ${event}`, EventService.name);
    await this.client.send({
      key: event,
      topic: event,
      messages: [message],
    } as any);
  }

  private dispatch =
    (event: string) =>
    async (
      value: string,
      key: string,
      offset: string,
      timestamp: number,
      partition: number,
    ) => {
      Logger.log(
        `Received ${event}, key= ${key}, payload=${value}`,
        EventService.name,
      );
      const subscribers = this.eventSubscriberMap.get(event);
      try {
        const promises = [];
        subscribers.forEach((subscriber) =>
          promises.push(subscriber(value, key)),
        );
        await Promise.all(promises);
        this.commitOffsets(event, offset, partition);
      } catch (e) {
        Logger.error(
          {
            msg: `Failed to handle message ${value}`,
            error: e.error,
            stack: e.stack,
          },
          EventService.name,
        );
        await this.emit(`${FAILED_TO_PROCEED_EVENT}${event}`, {
          key,
          value,
        });
      }
    };

  private commitOffsets(event: string, offset: string, partition: number) {
    (this.client as any).consumer.commitOffsets([
      {
        topic: event,
        partition,
        offset: String(Number(offset) + 1),
      },
    ]);
  }

  subscribe(event: string, method: any) {
    if (!this.eventSubscriberMap.has(event)) {
      this.eventSubscriberMap.set(event, []);
      SUBSCRIBER_MAP.set(event, this.dispatch(event));
    }
    this.eventSubscriberMap.set(event, [
      ...this.eventSubscriberMap.get(event),
      method,
    ]);
  }
}
