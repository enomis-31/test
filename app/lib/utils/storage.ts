import { CalendarEvent, STORAGE_KEY_EVENTS } from '@/app/types/event';

/**
 * Checks if localStorage is available (may be blocked in private browsing mode).
 * @returns true if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves all calendar events from localStorage.
 * @returns Array of CalendarEvent objects, empty array if none or on error
 */
export function getEventsFromStorage(): CalendarEvent[] {
  try {
    if (typeof window === 'undefined') {
      return [];
    }
    const data = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('[Storage] Events data is not an array');
      return [];
    }
    return parsed as CalendarEvent[];
  } catch (error) {
    console.error('[Storage] Failed to get events from storage:', error);
    return [];
  }
}

/**
 * Retrieves a single calendar event by its ID.
 * @param eventId - The unique event identifier
 * @returns CalendarEvent object or null if not found
 */
export function getEventById(eventId: string): CalendarEvent | null {
  try {
    const events = getEventsFromStorage();
    return events.find((event) => event.id === eventId) || null;
  } catch (error) {
    console.error('[Storage] Failed to get event by ID:', error);
    return null;
  }
}

/**
 * Gets events whose start time falls within a time window.
 * @param windowMs - Time window in milliseconds (e.g., 5000 for ±5 seconds)
 * @returns Array of CalendarEvent objects within the time window
 */
export function getEventsInTimeWindow(windowMs: number = 5000): CalendarEvent[] {
  try {
    const events = getEventsFromStorage();
    const now = Date.now();
    const windowStart = now - windowMs;
    const windowEnd = now + windowMs;

    return events.filter((event) => {
      const eventTime = new Date(event.startTime).getTime();
      return eventTime >= windowStart && eventTime <= windowEnd;
    });
  } catch (error) {
    console.error('[Storage] Failed to get events in time window:', error);
    return [];
  }
}

/**
 * Saves an event to localStorage (for testing purposes).
 * @param event - CalendarEvent to save
 */
export function saveEventToStorage(event: CalendarEvent): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const events = getEventsFromStorage();
    const existingIndex = events.findIndex((e) => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error('[Storage] Failed to save event:', error);
  }
}

/**
 * Removes an event from localStorage.
 * @param eventId - ID of the event to remove
 */
export function removeEventFromStorage(eventId: string): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const events = getEventsFromStorage();
    const filtered = events.filter((e) => e.id !== eventId);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(filtered));
  } catch (error) {
    console.error('[Storage] Failed to remove event:', error);
  }
}
