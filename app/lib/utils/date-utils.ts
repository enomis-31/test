import { format, parseISO, isValid } from 'date-fns';

/**
 * Checks if an event's start time falls within a time window of the current time.
 * @param eventStartTime - ISO 8601 string of the event start time
 * @param windowSeconds - Time window in seconds (default: 5 for ±5 seconds)
 * @returns true if event time is within the window
 */
export function isEventTimeInWindow(
  eventStartTime: string,
  windowSeconds: number = 5
): boolean {
  try {
    const eventTime = new Date(eventStartTime).getTime();
    const now = getCurrentTime();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;
    const windowEnd = now + windowMs;
    return eventTime >= windowStart && eventTime <= windowEnd;
  } catch (error) {
    console.error('[DateUtils] Failed to check event time window:', error);
    return false;
  }
}

/**
 * Formats an event start time for display.
 * @param startTime - ISO 8601 string of the start time
 * @returns Formatted time string (e.g., "14:30" or "2:30 PM")
 */
export function formatEventTime(startTime: string): string {
  try {
    const date = parseISO(startTime);
    if (!isValid(date)) {
      return 'Invalid time';
    }
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('[DateUtils] Failed to format event time:', error);
    return 'Invalid time';
  }
}

/**
 * Formats an event date and time for detailed display.
 * @param startTime - ISO 8601 string of the start time
 * @returns Formatted date and time string (e.g., "Jan 25, 2026 at 14:30")
 */
export function formatEventDateTime(startTime: string): string {
  try {
    const date = parseISO(startTime);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, "MMM d, yyyy 'at' HH:mm");
  } catch (error) {
    console.error('[DateUtils] Failed to format event date time:', error);
    return 'Invalid date';
  }
}

/**
 * Gets the current time in milliseconds.
 * @returns Current timestamp in milliseconds
 */
export function getCurrentTime(): number {
  return Date.now();
}

/**
 * Gets the current time as an ISO string.
 * @returns Current time as ISO 8601 string
 */
export function getCurrentTimeISO(): string {
  return new Date().toISOString();
}

/**
 * Generates a unique ID for notifications.
 * @returns Unique string ID
 */
export function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculates minutes until an event.
 * @param eventStartTime - ISO 8601 string of the event start time
 * @returns Number of minutes until the event (negative if past)
 */
export function getMinutesUntilEvent(eventStartTime: string): number {
  try {
    const eventTime = new Date(eventStartTime).getTime();
    const now = getCurrentTime();
    return Math.round((eventTime - now) / 60000);
  } catch (error) {
    return 0;
  }
}
