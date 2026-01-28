import {
  isStorageAvailable,
  getEventsFromStorage,
  getEventById,
  getEventsInTimeWindow,
  saveEventToStorage,
  removeEventFromStorage,
  saveToStorage,
  loadFromStorage,
} from '../storage';
import { CalendarEvent, STORAGE_KEY_EVENTS } from '@/app/types/event';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });
      expect(isStorageAvailable()).toBe(false);
    });
  });

  describe('getEventsFromStorage', () => {
    it('should return empty array when no events stored', () => {
      expect(getEventsFromStorage()).toEqual([]);
    });

    it('should return events from storage', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Test Event',
          startTime: '2026-01-28T12:00:00Z',
        },
      ];
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      
      expect(getEventsFromStorage()).toEqual(events);
    });

    it('should return empty array for invalid JSON', () => {
      localStorageMock.setItem(STORAGE_KEY_EVENTS, 'invalid-json');
      
      expect(getEventsFromStorage()).toEqual([]);
    });

    it('should return empty array when data is not an array', () => {
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify({ not: 'array' }));
      
      expect(getEventsFromStorage()).toEqual([]);
    });
  });

  describe('getEventById', () => {
    it('should return event when found', () => {
      const events: CalendarEvent[] = [
        { id: '1', title: 'Event 1', startTime: '2026-01-28T12:00:00Z' },
        { id: '2', title: 'Event 2', startTime: '2026-01-28T13:00:00Z' },
      ];
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      
      expect(getEventById('1')).toEqual(events[0]);
    });

    it('should return null when event not found', () => {
      const events: CalendarEvent[] = [
        { id: '1', title: 'Event 1', startTime: '2026-01-28T12:00:00Z' },
      ];
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      
      expect(getEventById('999')).toBeNull();
    });
  });

  describe('getEventsInTimeWindow', () => {
    it('should return events within time window', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      
      const events: CalendarEvent[] = [
        { id: '1', title: 'Event 1', startTime: new Date('2026-01-28T11:59:57Z').toISOString() }, // 3 seconds before
        { id: '2', title: 'Event 2', startTime: new Date('2026-01-28T12:00:03Z').toISOString() }, // 3 seconds after
        { id: '3', title: 'Event 3', startTime: new Date('2026-01-28T12:00:10Z').toISOString() }, // 10 seconds after
      ];
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      
      const result = getEventsInTimeWindow(5000); // 5 second window
      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['1', '2']);
    });

    it('should return empty array when no events in window', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      
      const events: CalendarEvent[] = [
        { id: '1', title: 'Event 1', startTime: new Date('2026-01-28T13:00:00Z').toISOString() },
      ];
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      
      expect(getEventsInTimeWindow(5000)).toEqual([]);
    });
  });

  describe('saveEventToStorage', () => {
    it('should save new event to storage', () => {
      const event: CalendarEvent = {
        id: '1',
        title: 'New Event',
        startTime: '2026-01-28T12:00:00Z',
      };
      
      saveEventToStorage(event);
      
      const saved = JSON.parse(localStorageMock.getItem(STORAGE_KEY_EVENTS) || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0]).toEqual(event);
    });

    it('should update existing event', () => {
      const existing: CalendarEvent = {
        id: '1',
        title: 'Old Title',
        startTime: '2026-01-28T12:00:00Z',
      };
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify([existing]));
      
      const updated: CalendarEvent = {
        id: '1',
        title: 'New Title',
        startTime: '2026-01-28T12:00:00Z',
      };
      
      saveEventToStorage(updated);
      
      const saved = JSON.parse(localStorageMock.getItem(STORAGE_KEY_EVENTS) || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].title).toBe('New Title');
    });
  });

  describe('removeEventFromStorage', () => {
    it('should remove event from storage', () => {
      const events: CalendarEvent[] = [
        { id: '1', title: 'Event 1', startTime: '2026-01-28T12:00:00Z' },
        { id: '2', title: 'Event 2', startTime: '2026-01-28T13:00:00Z' },
      ];
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      
      removeEventFromStorage('1');
      
      const saved = JSON.parse(localStorageMock.getItem(STORAGE_KEY_EVENTS) || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('2');
    });

    it('should handle removing non-existent event', () => {
      const events: CalendarEvent[] = [
        { id: '1', title: 'Event 1', startTime: '2026-01-28T12:00:00Z' },
      ];
      localStorageMock.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      
      removeEventFromStorage('999');
      
      const saved = JSON.parse(localStorageMock.getItem(STORAGE_KEY_EVENTS) || '[]');
      expect(saved).toHaveLength(1);
    });
  });

  describe('saveToStorage', () => {
    it('should save value to storage', () => {
      saveToStorage('test-key', 'test-value');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify('test-value')
      );
    });

    it('should handle objects', () => {
      const value = { name: 'test', count: 42 };
      saveToStorage('test-key', value);
      
      const saved = JSON.parse(localStorageMock.getItem('test-key') || 'null');
      expect(saved).toEqual(value);
    });
  });

  describe('loadFromStorage', () => {
    it('should load value from storage', () => {
      localStorageMock.setItem('test-key', JSON.stringify('test-value'));
      
      expect(loadFromStorage('test-key', 'default')).toBe('test-value');
    });

    it('should return default value when key not found', () => {
      expect(loadFromStorage('non-existent', 'default')).toBe('default');
    });

    it('should return default value for invalid JSON', () => {
      localStorageMock.setItem('test-key', 'invalid-json');
      
      expect(loadFromStorage('test-key', 'default')).toBe('default');
    });
  });
});
