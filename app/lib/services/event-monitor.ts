import { CalendarEvent } from '@/app/types/event';
import { getEventsInTimeWindow } from '@/app/lib/utils/storage';
import { isEventTimeInWindow } from '@/app/lib/utils/date-utils';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('EventMonitor');

/**
 * Callback type for when events need notifications
 */
type NotificationCallback = (event: CalendarEvent) => void;

/**
 * Callback type for tab visibility check
 */
type VisibilityCallback = () => boolean;

/**
 * EventMonitor service class.
 * Monitors calendar events and triggers notifications when event times arrive.
 */
export class EventMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private notifiedEventIds: Set<string> = new Set();
  private notificationCallback: NotificationCallback | null = null;
  private isTabActiveCallback: VisibilityCallback | null = null;
  private pollingIntervalMs: number = 60000; // 60 seconds (FR-008)
  private timeWindowSeconds: number = 5; // ±5 seconds (FR-001)

  /**
   * Sets the callback to be called when a notification should be triggered.
   */
  setNotificationCallback(callback: NotificationCallback): void {
    logger.debug('Setting notification callback');
    this.notificationCallback = callback;
  }

  /**
   * Sets the callback to check if the browser tab is active.
   */
  setVisibilityCallback(callback: VisibilityCallback): void {
    logger.debug('Setting visibility callback');
    this.isTabActiveCallback = callback;
  }

  /**
   * Starts the event monitoring process.
   * Begins polling localStorage for events every 60 seconds.
   */
  startMonitoring(): void {
    logger.info('Starting event monitoring', {
      function: 'startMonitoring',
      pollingIntervalMs: this.pollingIntervalMs,
      timeWindowSeconds: this.timeWindowSeconds,
    });

    if (this.intervalId) {
      logger.warn('Monitoring already started, ignoring duplicate call', {
        function: 'startMonitoring',
      });
      return;
    }

    // Do an immediate check
    this.checkEventsForNotifications();

    // Set up polling interval
    this.intervalId = setInterval(() => {
      this.checkEventsForNotifications();
    }, this.pollingIntervalMs);

    logger.debug('Monitoring started successfully', {
      function: 'startMonitoring',
    });
  }

  /**
   * Stops the event monitoring process.
   */
  stopMonitoring(): void {
    logger.info('Stopping event monitoring', {
      function: 'stopMonitoring',
    });

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.debug('Monitoring stopped successfully', {
        function: 'stopMonitoring',
      });
    } else {
      logger.debug('No active monitoring to stop', {
        function: 'stopMonitoring',
      });
    }
  }

  /**
   * Checks all calendar events and triggers notifications for events
   * whose start time falls within ±5 seconds of current time.
   */
  checkEventsForNotifications(): void {
    logger.debug('Checking events for notifications', {
      function: 'checkEventsForNotifications',
    });

    // Check if tab is active (FR-006)
    if (this.isTabActiveCallback && !this.isTabActiveCallback()) {
      logger.debug('Tab is not active, skipping check', {
        function: 'checkEventsForNotifications',
      });
      return;
    }

    try {
      // Get events in the time window
      const eventsInWindow = getEventsInTimeWindow(this.timeWindowSeconds * 1000);

      logger.debug('Events check completed', {
        function: 'checkEventsForNotifications',
        eventsFound: eventsInWindow.length,
      });

      if (eventsInWindow.length > 0) {
        logger.info('Found events in notification window', {
          function: 'checkEventsForNotifications',
          eventCount: eventsInWindow.length,
          eventIds: eventsInWindow.map((e) => e.id),
        });
      }

      let notificationsTriggered = 0;
      for (const event of eventsInWindow) {
        // Create a unique key for this event + time window to prevent duplicates
        const notificationKey = this.getNotificationKey(event);

        // Check if we've already notified for this event in this time window
        if (this.notifiedEventIds.has(notificationKey)) {
          logger.debug('Event already notified, skipping', {
            function: 'checkEventsForNotifications',
            eventId: event.id,
            notificationKey,
          });
          continue;
        }

        // Verify the event is actually in the time window
        if (!isEventTimeInWindow(event.startTime, this.timeWindowSeconds)) {
          logger.debug('Event not in time window, skipping', {
            function: 'checkEventsForNotifications',
            eventId: event.id,
            startTime: event.startTime,
          });
          continue;
        }

        // Trigger notification
        if (this.notificationCallback) {
          logger.info('Triggering notification for event', {
            function: 'checkEventsForNotifications',
            eventId: event.id,
            eventTitle: event.title,
            startTime: event.startTime,
          });
          this.notificationCallback(event);
          this.notifiedEventIds.add(notificationKey);
          notificationsTriggered++;
        } else {
          logger.warn('No notification callback set, cannot trigger notification', {
            function: 'checkEventsForNotifications',
            eventId: event.id,
          });
        }
      }

      if (notificationsTriggered > 0) {
        logger.info('Notifications triggered', {
          function: 'checkEventsForNotifications',
          count: notificationsTriggered,
        });
      }

      // Clean up old notification keys (older than 1 minute)
      this.cleanupNotifiedEventIds();
    } catch (error) {
      logger.error('Error checking events for notifications', error, {
        function: 'checkEventsForNotifications',
      });
    }
  }

  /**
   * Generates a unique key for an event notification.
   * Includes a time bucket to prevent re-notifying for the same event.
   */
  private getNotificationKey(event: CalendarEvent): string {
    // Create a time bucket based on the event's start time
    // This ensures we don't notify twice for the same event time
    const eventTime = new Date(event.startTime).getTime();
    const timeBucket = Math.floor(eventTime / 60000); // 1-minute buckets
    return `${event.id}-${timeBucket}`;
  }

  /**
   * Cleans up old notification keys to prevent memory leaks.
   */
  private cleanupNotifiedEventIds(): void {
    // Keep only recent notification keys (last 10 minutes worth)
    const currentTimeBucket = Math.floor(Date.now() / 60000);
    const keysToRemove: string[] = [];

    this.notifiedEventIds.forEach((key) => {
      const parts = key.split('-');
      const timeBucket = parseInt(parts[parts.length - 1], 10);
      if (currentTimeBucket - timeBucket > 10) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.notifiedEventIds.delete(key));
  }

  /**
   * Manually triggers a check for notifications (useful for testing).
   */
  triggerCheck(): void {
    logger.debug('Manual check triggered', {
      function: 'triggerCheck',
    });
    this.checkEventsForNotifications();
  }

  /**
   * Clears the notified events cache (useful for testing).
   */
  clearNotifiedCache(): void {
    const cacheSize = this.notifiedEventIds.size;
    this.notifiedEventIds.clear();
    logger.debug('Cleared notified events cache', {
      function: 'clearNotifiedCache',
      clearedCount: cacheSize,
    });
  }
}

// Singleton instance for easy access
let eventMonitorInstance: EventMonitor | null = null;

export function getEventMonitor(): EventMonitor {
  if (!eventMonitorInstance) {
    logger.debug('Creating new EventMonitor instance', {
      function: 'getEventMonitor',
    });
    eventMonitorInstance = new EventMonitor();
  }
  return eventMonitorInstance;
}
