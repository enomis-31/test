import { CalendarEvent } from '@/app/types/event';
import { getEventsInTimeWindow } from '@/app/lib/utils/storage';
import { isEventTimeInWindow } from '@/app/lib/utils/date-utils';

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
    this.notificationCallback = callback;
  }

  /**
   * Sets the callback to check if the browser tab is active.
   */
  setVisibilityCallback(callback: VisibilityCallback): void {
    this.isTabActiveCallback = callback;
  }

  /**
   * Starts the event monitoring process.
   * Begins polling localStorage for events every 60 seconds.
   */
  startMonitoring(): void {
    if (this.intervalId) {
      console.warn('[EventMonitor] Already monitoring');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[EventMonitor] Starting monitoring...');
    }

    // Do an immediate check
    this.checkEventsForNotifications();

    // Set up polling interval
    this.intervalId = setInterval(() => {
      this.checkEventsForNotifications();
    }, this.pollingIntervalMs);
  }

  /**
   * Stops the event monitoring process.
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[EventMonitor] Stopped monitoring');
      }
    }
  }

  /**
   * Checks all calendar events and triggers notifications for events
   * whose start time falls within ±5 seconds of current time.
   */
  checkEventsForNotifications(): void {
    // Check if tab is active (FR-006)
    if (this.isTabActiveCallback && !this.isTabActiveCallback()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[EventMonitor] Tab is not active, skipping check');
      }
      return;
    }

    try {
      // Get events in the time window
      const eventsInWindow = getEventsInTimeWindow(this.timeWindowSeconds * 1000);

      if (process.env.NODE_ENV === 'development' && eventsInWindow.length > 0) {
        console.log('[EventMonitor] Found events in window:', eventsInWindow);
      }

      for (const event of eventsInWindow) {
        // Create a unique key for this event + time window to prevent duplicates
        const notificationKey = this.getNotificationKey(event);

        // Check if we've already notified for this event in this time window
        if (this.notifiedEventIds.has(notificationKey)) {
          continue;
        }

        // Verify the event is actually in the time window
        if (!isEventTimeInWindow(event.startTime, this.timeWindowSeconds)) {
          continue;
        }

        // Trigger notification
        if (this.notificationCallback) {
          this.notificationCallback(event);
          this.notifiedEventIds.add(notificationKey);

          if (process.env.NODE_ENV === 'development') {
            console.log('[EventMonitor] Triggered notification for event:', event.title);
          }
        }
      }

      // Clean up old notification keys (older than 1 minute)
      this.cleanupNotifiedEventIds();
    } catch (error) {
      console.error('[EventMonitor] Error checking events:', error);
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
    this.checkEventsForNotifications();
  }

  /**
   * Clears the notified events cache (useful for testing).
   */
  clearNotifiedCache(): void {
    this.notifiedEventIds.clear();
  }
}

// Singleton instance for easy access
let eventMonitorInstance: EventMonitor | null = null;

export function getEventMonitor(): EventMonitor {
  if (!eventMonitorInstance) {
    eventMonitorInstance = new EventMonitor();
  }
  return eventMonitorInstance;
}
