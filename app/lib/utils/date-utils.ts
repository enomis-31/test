import { format, parseISO, isValid } from 'date-fns';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('DateUtils');

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
  logger.debug('Checking if event time is in window', {
    function: 'isEventTimeInWindow',
    eventStartTime,
    windowSeconds,
  });

  try {
    const eventTime = new Date(eventStartTime).getTime();
    const now = getCurrentTime();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;
    const windowEnd = now + windowMs;
    const inWindow = eventTime >= windowStart && eventTime <= windowEnd;
    
    logger.debug('Event time window check completed', {
      function: 'isEventTimeInWindow',
      eventStartTime,
      windowSeconds,
      inWindow,
    });
    
    return inWindow;
  } catch (error) {
    logger.error('Failed to check event time window', error, {
      function: 'isEventTimeInWindow',
      eventStartTime,
      windowSeconds,
    });
    return false;
  }
}

/**
 * Formats an event start time for display.
 * @param startTime - ISO 8601 string of the start time
 * @returns Formatted time string (e.g., "14:30" or "2:30 PM")
 */
export function formatEventTime(startTime: string): string {
  logger.debug('Formatting event time', {
    function: 'formatEventTime',
    startTime,
  });

  try {
    const date = parseISO(startTime);
    if (!isValid(date)) {
      logger.warn('Invalid date for formatting', {
        function: 'formatEventTime',
        startTime,
      });
      return 'Invalid time';
    }
    const formatted = format(date, 'HH:mm');
    
    logger.debug('Event time formatted', {
      function: 'formatEventTime',
      startTime,
      formatted,
    });
    
    return formatted;
  } catch (error) {
    logger.error('Failed to format event time', error, {
      function: 'formatEventTime',
      startTime,
    });
    return 'Invalid time';
  }
}

/**
 * Formats an event date and time for detailed display.
 * @param startTime - ISO 8601 string of the start time
 * @returns Formatted date and time string (e.g., "Jan 25, 2026 at 14:30")
 */
export function formatEventDateTime(startTime: string): string {
  logger.debug('Formatting event date and time', {
    function: 'formatEventDateTime',
    startTime,
  });

  try {
    const date = parseISO(startTime);
    if (!isValid(date)) {
      logger.warn('Invalid date for formatting', {
        function: 'formatEventDateTime',
        startTime,
      });
      return 'Invalid date';
    }
    const formatted = format(date, "MMM d, yyyy 'at' HH:mm");
    
    logger.debug('Event date and time formatted', {
      function: 'formatEventDateTime',
      startTime,
      formatted,
    });
    
    return formatted;
  } catch (error) {
    logger.error('Failed to format event date time', error, {
      function: 'formatEventDateTime',
      startTime,
    });
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
  logger.debug('Calculating minutes until event', {
    function: 'getMinutesUntilEvent',
    eventStartTime,
  });

  try {
    const eventTime = new Date(eventStartTime).getTime();
    const now = getCurrentTime();
    const minutes = Math.round((eventTime - now) / 60000);
    
    logger.debug('Minutes until event calculated', {
      function: 'getMinutesUntilEvent',
      eventStartTime,
      minutes,
    });
    
    return minutes;
  } catch (error) {
    logger.error('Failed to calculate minutes until event', error, {
      function: 'getMinutesUntilEvent',
      eventStartTime,
    });
    return 0;
  }
}
