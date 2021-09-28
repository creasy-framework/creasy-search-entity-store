import { EventService } from '../../src/event';
import { SUBSCRIBER_MAP } from '@rob3000/nestjs-kafka';

describe('EventService', () => {
  let eventService;
  let kafkaService;
  let subscriber1;
  let subscriber2;
  const eventName = 'event';
  const offset = '1';
  const partition = 0;

  beforeEach(() => {
    kafkaService = {
      emit: jest.fn(),
      consumer: {
        commitOffsets: jest.fn(),
      },
    };
    subscriber1 = jest.fn();
    subscriber2 = jest.fn();
    eventService = new EventService(kafkaService);
    eventService.subscribe(eventName, subscriber1);
    eventService.subscribe(eventName, subscriber2);
  });

  it('should have dispatching fn in SUBSCRIBER_MAP', () => {
    expect(typeof SUBSCRIBER_MAP.get(eventName)).toEqual('function');
  });

  it('should call subscribers when dispatching fn get called', async () => {
    const dispatcher = SUBSCRIBER_MAP.get(eventName);
    await dispatcher('value', 'key', offset, 1234, partition);
    expect(subscriber1).toHaveBeenCalledWith('value', 'key');
    expect(subscriber2).toHaveBeenCalledWith('value', 'key');
  });

  it('should commit offset if no exception thrown from subscribers', async () => {
    const dispatcher = SUBSCRIBER_MAP.get(eventName);
    await dispatcher('value', 'key', offset, 1234, partition);
    expect(kafkaService.consumer.commitOffsets).toHaveBeenCalledWith([
      {
        partition,
        offset: '2',
        topic: eventName,
      },
    ]);
  });

  it('should not commit offset if promised is rejected by subscribers', async () => {
    subscriber1 = jest.fn().mockImplementation(() => Promise.reject());
    eventService = new EventService(kafkaService);
    eventService.subscribe(eventName, subscriber1);
    expect(kafkaService.consumer.commitOffsets).not.toHaveBeenCalled();
  });

  it('should not commit offset if exception is threw by subscribers', async () => {
    subscriber1 = jest.fn().mockImplementation(() => {
      throw new Error();
    });
    eventService = new EventService(kafkaService);
    eventService.subscribe(eventName, subscriber1);
    expect(kafkaService.consumer.commitOffsets).not.toHaveBeenCalled();
  });
});
