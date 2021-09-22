import { Inject } from '@nestjs/common';
import { SubscribeTo } from '@rob3000/nestjs-kafka';
import { EventService } from './EventService';
export const On = SubscribeTo;

export function Observe(topics: string[]) {
  const injectEventService = Inject(EventService);
  return (target) => {
    if (!target.prototype.__eventService) {
      injectEventService(target.prototype, '__eventService');
      target.prototype.onModuleInit = function () {
        topics.forEach((topic) => this.__eventService.subscribe(topic, this));
      };
    }
  };
}
