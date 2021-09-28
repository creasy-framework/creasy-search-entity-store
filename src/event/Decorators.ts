import { Inject } from '@nestjs/common';
import { EventService } from './EventService';

export function Subscribe(events: string[]) {
  const injectEventService = Inject(EventService);
  return (target) => {
    if (!target.prototype.__eventService) {
      injectEventService(target.prototype, '__eventService');
      target.prototype.onModuleInit = function () {
        // events.forEach((event) => {
        //   const handler = target.prototype[`on${event}`];
        //   if (handler) {
        //     this.__eventService.subscribe(event, function (...args) {});
        //   }
        // });
      };
    }
  };
}
