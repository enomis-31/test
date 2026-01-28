'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { CalendarEvent, NotificationState } from '@/app/types/event';
import { generateNotificationId, getCurrentTimeISO } from '@/app/lib/utils/date-utils';
import { getEventById } from '@/app/lib/utils/storage';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('Notifications');

/**
 * Action types for the notification reducer.
 */
type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: NotificationState }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'SHOW_EVENT_DETAILS'; payload: string }
  | { type: 'HIDE_EVENT_DETAILS' }
  | { type: 'MUTE_SOUND'; payload: string }
  | { type: 'CLEAR_OLD_NOTIFICATIONS'; payload: number };

/**
 * Internal state interface for the notification context.
 */
interface NotificationContextState {
  /** Array of all notification states */
  notifications: NotificationState[];
  /** Currently selected event details to display in modal, or null if modal is closed */
  selectedEventDetails: CalendarEvent | null;
  /** Whether the event details modal is currently open */
  isDetailsModalOpen: boolean;
}

/**
 * Public interface for the notification context value.
 * Includes both state and action methods.
 */
interface NotificationContextValue extends NotificationContextState {
  /** Adds a new notification for the given calendar event */
  addNotification: (event: CalendarEvent) => void;
  /** Dismisses a notification by its ID */
  dismissNotification: (notificationId: string) => void;
  /** Shows event details modal for a notification */
  showEventDetails: (notificationId: string) => void;
  /** Hides the event details modal */
  hideEventDetails: () => void;
  /** Mutes sound for a specific notification */
  muteSound: (notificationId: string) => void;
  /** Clears notifications older than the specified age in milliseconds */
  clearOldNotifications: (maxAgeMs?: number) => void;
}

/**
 * Initial state for the notification context.
 */
const initialState: NotificationContextState = {
  notifications: [],
  selectedEventDetails: null,
  isDetailsModalOpen: false,
};

/**
 * Reducer function for managing notification state.
 * Handles all notification-related actions.
 * @param state - Current notification context state
 * @param action - Action to perform on the state
 * @returns New state after applying the action
 */
function notificationReducer(
  state: NotificationContextState,
  action: NotificationAction
): NotificationContextState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      // Prevent duplicates based on eventId
      const exists = state.notifications.some(
        (n) => n.eventId === action.payload.eventId && !n.isDismissed
      );
      if (exists) {
        logger.debug('Duplicate notification prevented', {
          function: 'notificationReducer',
          eventId: action.payload.eventId,
        });
        return state;
      }
      // Limit to 10 notifications max (SC-004)
      const newNotifications = [...state.notifications, action.payload];
      if (newNotifications.length > 10) {
        logger.debug('Notification limit reached, removing oldest', {
          function: 'notificationReducer',
          totalNotifications: newNotifications.length,
        });
        newNotifications.shift(); // Remove oldest
      }
      return {
        ...state,
        notifications: newNotifications,
      };
    }

    case 'DISMISS_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
    }

    case 'SHOW_EVENT_DETAILS': {
      try {
        const notification = state.notifications.find(
          (n) => n.id === action.payload
        );
        if (!notification) {
          logger.error('Notification not found for showing details', undefined, {
            function: 'notificationReducer',
            notificationId: action.payload,
            availableNotificationIds: state.notifications.map((n) => n.id),
          });
          return state;
        }
        // Get full event details from storage
        let event: CalendarEvent | null = null;
        try {
          event = getEventById(notification.eventId);
        } catch (error) {
          logger.error('Failed to get event by ID from storage', error, {
            function: 'notificationReducer',
            notificationId: action.payload,
            eventId: notification.eventId,
          });
        }
        if (!event) {
          logger.error('Event not found in storage', undefined, {
            function: 'notificationReducer',
            notificationId: action.payload,
            eventId: notification.eventId,
          });
        }
        return {
          ...state,
          selectedEventDetails: event,
          isDetailsModalOpen: true,
          // Dismiss the notification when showing details
          notifications: state.notifications.filter(
            (n) => n.id !== action.payload
          ),
        };
      } catch (error) {
        logger.error('Unexpected error in SHOW_EVENT_DETAILS reducer', error, {
          function: 'notificationReducer',
          notificationId: action.payload,
        });
        // Fail loud: log error but return state to prevent breaking the app
        return state;
      }
    }

    case 'HIDE_EVENT_DETAILS': {
      return {
        ...state,
        selectedEventDetails: null,
        isDetailsModalOpen: false,
      };
    }

    case 'MUTE_SOUND': {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, isSoundMuted: true } : n
        ),
      };
    }

    case 'CLEAR_OLD_NOTIFICATIONS': {
      const maxAgeMs = action.payload;
      const now = Date.now();
      return {
        ...state,
        notifications: state.notifications.filter((n) => {
          const triggeredAt = new Date(n.triggeredAt).getTime();
          return now - triggeredAt < maxAgeMs;
        }),
      };
    }

    default: {
      // Fail loud: log unknown action types
      const unknownAction = action as { type: string };
      logger.error('Unknown notification action type', undefined, {
        function: 'notificationReducer',
        actionType: unknownAction.type,
        availableActions: ['ADD_NOTIFICATION', 'DISMISS_NOTIFICATION', 'SHOW_EVENT_DETAILS', 'HIDE_EVENT_DETAILS', 'MUTE_SOUND', 'CLEAR_OLD_NOTIFICATIONS'],
      });
      return state;
    }
  }
}

/**
 * React context for notification state and actions.
 */
const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

/**
 * Props for the NotificationProvider component.
 */
interface NotificationProviderProps {
  /** Child components that will have access to the notification context */
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  /**
   * Adds a new notification for a calendar event.
   * @param event - The calendar event to create a notification for
   */
  const addNotification = useCallback((event: CalendarEvent): void => {
    logger.debug('Adding notification', {
      function: 'addNotification',
      eventId: event.id,
      eventTitle: event.title,
    });

    const notification: NotificationState = {
      id: generateNotificationId(),
      eventId: event.id,
      eventTitle: event.title,
      eventStartTime: event.startTime,
      eventDescription: event.description,
      triggeredAt: getCurrentTimeISO(),
      isDismissed: false,
      isSoundMuted: false,
      isDetailsShown: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    logger.info('Notification added', {
      function: 'addNotification',
      notificationId: notification.id,
      eventId: event.id,
      eventTitle: event.title,
    });
  }, []);

  /**
   * Dismisses a notification by removing it from the list.
   * @param notificationId - The ID of the notification to dismiss
   */
  const dismissNotification = useCallback((notificationId: string): void => {
    logger.debug('Dismissing notification', {
      function: 'dismissNotification',
      notificationId,
    });

    dispatch({ type: 'DISMISS_NOTIFICATION', payload: notificationId });
    
    logger.info('Notification dismissed', {
      function: 'dismissNotification',
      notificationId,
    });
  }, []);

  /**
   * Shows event details modal for a notification.
   * @param notificationId - The ID of the notification to show details for
   */
  const showEventDetails = useCallback((notificationId: string): void => {
    logger.debug('Showing event details', {
      function: 'showEventDetails',
      notificationId,
    });

    dispatch({ type: 'SHOW_EVENT_DETAILS', payload: notificationId });
    
    logger.info('Event details shown', {
      function: 'showEventDetails',
      notificationId,
    });
  }, []);

  /**
   * Hides the event details modal.
   */
  const hideEventDetails = useCallback((): void => {
    logger.debug('Hiding event details', {
      function: 'hideEventDetails',
    });

    dispatch({ type: 'HIDE_EVENT_DETAILS' });
    
    logger.debug('Event details hidden', {
      function: 'hideEventDetails',
    });
  }, []);

  /**
   * Mutes sound for a specific notification.
   * @param notificationId - The ID of the notification to mute
   */
  const muteSound = useCallback((notificationId: string): void => {
    logger.debug('Muting sound for notification', {
      function: 'muteSound',
      notificationId,
    });

    dispatch({ type: 'MUTE_SOUND', payload: notificationId });
    
    logger.debug('Sound muted for notification', {
      function: 'muteSound',
      notificationId,
    });
  }, []);

  /**
   * Clears notifications older than the specified age.
   * @param maxAgeMs - Maximum age in milliseconds (default: 300000 = 5 minutes)
   */
  const clearOldNotifications = useCallback((maxAgeMs: number = 300000): void => {
    logger.debug('Clearing old notifications', {
      function: 'clearOldNotifications',
      maxAgeMs,
    });

    dispatch({ type: 'CLEAR_OLD_NOTIFICATIONS', payload: maxAgeMs });
    
    logger.debug('Old notifications cleared', {
      function: 'clearOldNotifications',
      maxAgeMs,
    });
  }, []);

  const value: NotificationContextValue = {
    ...state,
    addNotification,
    dismissNotification,
    showEventDetails,
    hideEventDetails,
    muteSound,
    clearOldNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Custom hook to access notification context.
 * Must be used within a NotificationProvider.
 * @returns Notification context value with state and actions
 * @throws Error if used outside NotificationProvider
 */
export function useNotifications(): NotificationContextValue {
  logger.debug('Using notifications hook', {
    function: 'useNotifications',
  });

  const context = useContext(NotificationContext);
  if (context === undefined) {
    logger.error('useNotifications called outside NotificationProvider', undefined, {
      function: 'useNotifications',
    });
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}
