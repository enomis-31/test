import { EventMonitor, getEventMonitor } from '../event-monitor';
import { CalendarEvent } from '@/app/types/event';
import * as storage from '@/app/lib/utils/storage';
import * as dateUtils from '@/app/lib/utils/date-utils';

jest.mock('@/app/lib/utils/storage');
jest.mock('@/app/lib/utils/date-utils');

describe('EventMonitor', () => {
  let monitor: EventMonitor;
  let notificationCallback: jest.Mock;
  let visibilityCallback: jest.Mock;

  beforeEach(() => {
    monitor = new EventMonitor();
    notificationCallback = jest.fn();
    visibilityCallback = jest.fn(() => true);
    
    monitor.setNotificationCallback(notificationCallback);
    monitor.setVisibilityCallback(visibilityCallback);
    
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    monitor.stopMonitoring();
    jest.useRealTimers();
  });

  describe('startMonitoring', () => {
    it('should start monitoring and check events immediately', () => {
      const events: CalendarEvent[] = [];
      jest.spyOn(storage, 'getEventsInTimeWindow').mockReturnValue(events);
      jest.spyOn(dateUtils, 'isEventTimeInWindow').mockReturnValue(false);

      monitor.startMonitoring();

      expect(storage.getEventsInTimeWindow).toHaveBeenCalled();
    });

    it('should not start monitoring if already started', () => {
      monitor.startMonitoring();
      const firstCallCount = (storage.getEventsInTimeWindow as jest.Mock).mock.calls.length;

      monitor.startMonitoring();
      const secondCallCount = (storage.getEventsInTimeWindow as jest.Mock).mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should poll at specified interval', () => {
      const events: CalendarEvent[] = [];
      jest.spyOn(storage, 'getEventsInTimeWindow').mockReturnValue(events);
      jest.spyOn(dateUtils, 'isEventTimeInWindow').mockReturnValue(false);

      monitor.startMonitoring();

      jest.advanceTimersByTime(60000); // 60 seconds

      expect(storage.getEventsInTimeWindow).toHaveBeenCalledTimes(2); // initial + interval
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring', () => {
      monitor.startMonitoring();
      monitor.stopMonitoring();

      const callCount = (storage.getEventsInTimeWindow as jest.Mock).mock.calls.length;
      jest.advanceTimersByTime(60000);

      expect((storage.getEventsInTimeWindow as jest.Mock).mock.calls.length).toBe(callCount);
    });

    it('should handle stop when not monitoring', () => {
      expect(() => monitor.stopMonitoring()).not.toThrow();
    });
  });

  describe('checkEventsForNotifications', () => {
    it('should trigger notification for event in window', () => {
      const event: CalendarEvent = {
        id: '1',
        title: 'Test Event',
        startTime: '2026-01-28T12:00:00Z',
      };
      
      jest.spyOn(storage, 'getEventsInTimeWindow').mockReturnValue([event]);
      jest.spyOn(dateUtils, 'isEventTimeInWindow').mockReturnValue(true);

      monitor.triggerCheck();

      expect(notificationCallback).toHaveBeenCalledWith(event);
    });

    it('should not trigger notification when tab is not active', () => {
      visibilityCallback.mockReturnValue(false);
      
      const event: CalendarEvent = {
        id: '1',
        title: 'Test Event',
        startTime: '2026-01-28T12:00:00Z',
      };
      
      jest.spyOn(storage, 'getEventsInTimeWindow').mockReturnValue([event]);

      monitor.triggerCheck();

      expect(notificationCallback).not.toHaveBeenCalled();
    });

    it('should not trigger duplicate notifications', () => {
      const event: CalendarEvent = {
        id: '1',
        title: 'Test Event',
        startTime: '2026-01-28T12:00:00Z',
      };
      
      jest.spyOn(storage, 'getEventsInTimeWindow').mockReturnValue([event]);
      jest.spyOn(dateUtils, 'isEventTimeInWindow').mockReturnValue(true);

      monitor.triggerCheck();
      monitor.triggerCheck();

      expect(notificationCallback).toHaveBeenCalledTimes(1);
    });

    it('should not trigger notification if event not in window', () => {
      const event: CalendarEvent = {
        id: '1',
        title: 'Test Event',
        startTime: '2026-01-28T12:00:00Z',
      };
      
      jest.spyOn(storage, 'getEventsInTimeWindow').mockReturnValue([event]);
      jest.spyOn(dateUtils, 'isEventTimeInWindow').mockReturnValue(false);

      monitor.triggerCheck();

      expect(notificationCallback).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      jest.spyOn(storage, 'getEventsInTimeWindow').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => monitor.triggerCheck()).not.toThrow();
    });
  });

  describe('clearNotifiedCache', () => {
    it('should clear notified events cache', () => {
      const event: CalendarEvent = {
        id: '1',
        title: 'Test Event',
        startTime: '2026-01-28T12:00:00Z',
      };
      
      jest.spyOn(storage, 'getEventsInTimeWindow').mockReturnValue([event]);
      jest.spyOn(dateUtils, 'isEventTimeInWindow').mockReturnValue(true);

      monitor.triggerCheck();
      monitor.clearNotifiedCache();
      monitor.triggerCheck();

      expect(notificationCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('getEventMonitor', () => {
    it('should return singleton instance', () => {
      const instance1 = getEventMonitor();
      const instance2 = getEventMonitor();

      expect(instance1).toBe(instance2);
    });
  });
});
