/**
 * Represents a scheduled calendar event that can trigger notifications.
 */
export interface CalendarEvent {
  /** Unique identifier for the event */
  id: string;
  /** Event title/name displayed in notifications (max 200 chars) */
  title: string;
  /** Scheduled start time of the event (ISO 8601 string) */
  startTime: string;
  /** Additional event details (max 1000 chars, optional) */
  description?: string;
  /** Scheduled end time (optional, not used for notifications) */
  endTime?: string;
  /** Timestamp when event was created (optional) */
  createdAt?: string;
  /** Timestamp when event was last modified (optional) */
  updatedAt?: string;
}

/**
 * Represents the state of a displayed notification.
 */
export interface NotificationState {
  /** Unique identifier for this notification instance */
  id: string;
  /** Reference to the Calendar Event that triggered this notification */
  eventId: string;
  /** Cached event title for display */
  eventTitle: string;
  /** Cached event start time for display */
  eventStartTime: string;
  /** Cached event description for display (optional) */
  eventDescription?: string;
  /** Timestamp when notification was triggered */
  triggeredAt: string;
  /** Whether user has dismissed this notification */
  isDismissed: boolean;
  /** Whether sound was muted for this notification */
  isSoundMuted: boolean;
  /** Whether event details view is currently displayed */
  isDetailsShown: boolean;
}

/**
 * Storage key for calendar events in localStorage
 */
export const STORAGE_KEY_EVENTS = 'calendar_events';
