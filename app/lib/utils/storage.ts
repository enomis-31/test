import { CalendarEvent, STORAGE_KEY_EVENTS } from '@/app/types/event';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('Storage');

/**
 * Checks if localStorage is available (may be blocked in private browsing mode).
 * @returns true if localStorage is available
 */
export function isStorageAvailable(): boolean {
  logger.debug('Checking storage availability', {
    function: 'isStorageAvailable',
  });

  try {
    if (typeof window === 'undefined') {
      logger.debug('Window is undefined, storage not available', {
        function: 'isStorageAvailable',
      });
      return false;
    }
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    logger.debug('Storage is available', {
      function: 'isStorageAvailable',
    });
    return true;
  } catch (error) {
    logger.warn('Storage is not available', {
      function: 'isStorageAvailable',
      error,
    });
    return false;
  }
}

/**
 * Retrieves all calendar events from localStorage.
 * @returns Array of CalendarEvent objects, empty array if none or on error
 */
export function getEventsFromStorage(): CalendarEvent[] {
  logger.debug('Getting events from storage', {
    function: 'getEventsFromStorage',
  });

  try {
    if (typeof window === 'undefined') {
      logger.debug('Window is undefined, returning empty array', {
        function: 'getEventsFromStorage',
      });
      return [];
    }
    const data = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!data) {
      logger.debug('No events data found in storage', {
        function: 'getEventsFromStorage',
      });
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      logger.warn('Events data is not an array', {
        function: 'getEventsFromStorage',
      });
      return [];
    }
    
    const events = parsed as CalendarEvent[];
    logger.debug('Events retrieved from storage', {
      function: 'getEventsFromStorage',
      eventCount: events.length,
    });
    
    return events;
  } catch (error) {
    logger.error('Failed to get events from storage', error, {
      function: 'getEventsFromStorage',
    });
    return [];
  }
}

/**
 * Retrieves a single calendar event by its ID.
 * @param eventId - The unique event identifier
 * @returns CalendarEvent object or null if not found
 */
export function getEventById(eventId: string): CalendarEvent | null {
  logger.debug('Getting event by ID', {
    function: 'getEventById',
    eventId,
  });

  try {
    const events = getEventsFromStorage();
    const event = events.find((event) => event.id === eventId) || null;
    
    logger.debug('Event retrieved by ID', {
      function: 'getEventById',
      eventId,
      found: !!event,
    });
    
    return event;
  } catch (error) {
    logger.error('Failed to get event by ID', error, {
      function: 'getEventById',
      eventId,
    });
    return null;
  }
}

/**
 * Gets events whose start time falls within a time window.
 * @param windowMs - Time window in milliseconds (e.g., 5000 for ±5 seconds)
 * @returns Array of CalendarEvent objects within the time window
 */
export function getEventsInTimeWindow(windowMs: number = 5000): CalendarEvent[] {
  logger.debug('Getting events in time window', {
    function: 'getEventsInTimeWindow',
    windowMs,
  });

  try {
    const events = getEventsFromStorage();
    const now = Date.now();
    const windowStart = now - windowMs;
    const windowEnd = now + windowMs;

    const filtered = events.filter((event) => {
      const eventTime = new Date(event.startTime).getTime();
      return eventTime >= windowStart && eventTime <= windowEnd;
    });

    logger.debug('Events in time window retrieved', {
      function: 'getEventsInTimeWindow',
      totalEvents: events.length,
      eventsInWindow: filtered.length,
      windowMs,
    });

    return filtered;
  } catch (error) {
    logger.error('Failed to get events in time window', error, {
      function: 'getEventsInTimeWindow',
      windowMs,
    });
    return [];
  }
}

/**
 * Saves an event to localStorage (for testing purposes).
 * @param event - CalendarEvent to save
 */
export function saveEventToStorage(event: CalendarEvent): void {
  logger.debug('Saving event to storage', {
    function: 'saveEventToStorage',
    eventId: event.id,
    eventTitle: event.title,
  });

  try {
    if (typeof window === 'undefined') {
      logger.warn('Window is undefined, cannot save event', {
        function: 'saveEventToStorage',
        eventId: event.id,
      });
      return;
    }
    const events = getEventsFromStorage();
    const existingIndex = events.findIndex((e) => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
      logger.debug('Event updated in storage', {
        function: 'saveEventToStorage',
        eventId: event.id,
      });
    } else {
      events.push(event);
      logger.debug('Event added to storage', {
        function: 'saveEventToStorage',
        eventId: event.id,
      });
    }
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    
    logger.info('Event saved to storage successfully', {
      function: 'saveEventToStorage',
      eventId: event.id,
      totalEvents: events.length,
    });
  } catch (error) {
    logger.error('Failed to save event', error, {
      function: 'saveEventToStorage',
      eventId: event.id,
    });
  }
}

/**
 * Removes an event from localStorage.
 * @param eventId - ID of the event to remove
 */
export function removeEventFromStorage(eventId: string): void {
  logger.debug('Removing event from storage', {
    function: 'removeEventFromStorage',
    eventId,
  });

  try {
    if (typeof window === 'undefined') {
      logger.warn('Window is undefined, cannot remove event', {
        function: 'removeEventFromStorage',
        eventId,
      });
      return;
    }
    const events = getEventsFromStorage();
    const filtered = events.filter((e) => e.id !== eventId);
    
    if (filtered.length === events.length) {
      logger.warn('Event not found in storage', {
        function: 'removeEventFromStorage',
        eventId,
      });
      return;
    }
    
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(filtered));
    
    logger.info('Event removed from storage', {
      function: 'removeEventFromStorage',
      eventId,
      remainingEvents: filtered.length,
    });
  } catch (error) {
    logger.error('Failed to remove event', error, {
      function: 'removeEventFromStorage',
      eventId,
    });
  }
}

/**
 * Saves a value to localStorage with JSON serialization and error handling.
 * @param key - Storage key
 * @param value - Value to save (must be JSON-serializable)
 */
export function saveToStorage<T>(key: string, value: T): void {
  logger.debug('Saving value to storage', {
    function: 'saveToStorage',
    key,
  });

  try {
    if (typeof window === 'undefined') {
      logger.warn('Window is undefined, cannot save to storage', {
        function: 'saveToStorage',
        key,
      });
      return;
    }
    if (!isStorageAvailable()) {
      logger.warn('localStorage not available, cannot save', {
        function: 'saveToStorage',
        key,
      });
      return;
    }
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    
    logger.debug('Value saved to storage successfully', {
      function: 'saveToStorage',
      key,
    });
  } catch (error) {
    logger.error('Failed to save value to storage', error, {
      function: 'saveToStorage',
      key,
    });
  }
}

/**
 * Loads a value from localStorage with JSON parsing and error handling.
 * @param key - Storage key
 * @param defaultValue - Default value to return if key doesn't exist or parsing fails
 * @returns Parsed value or defaultValue
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  logger.debug('Loading value from storage', {
    function: 'loadFromStorage',
    key,
  });

  try {
    if (typeof window === 'undefined') {
      logger.debug('Window is undefined, returning default value', {
        function: 'loadFromStorage',
        key,
      });
      return defaultValue;
    }
    if (!isStorageAvailable()) {
      logger.warn('localStorage not available, returning default value', {
        function: 'loadFromStorage',
        key,
      });
      return defaultValue;
    }
    const data = localStorage.getItem(key);
    if (data === null) {
      logger.debug('Key not found in storage, returning default value', {
        function: 'loadFromStorage',
        key,
      });
      return defaultValue;
    }
    const parsed = JSON.parse(data) as T;
    
    logger.debug('Value loaded from storage successfully', {
      function: 'loadFromStorage',
      key,
    });
    
    return parsed;
  } catch (error) {
    logger.error('Failed to load value from storage', error, {
      function: 'loadFromStorage',
      key,
    });
    return defaultValue;
  }
}
