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

// Action types
type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: NotificationState }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'SHOW_EVENT_DETAILS'; payload: string }
  | { type: 'HIDE_EVENT_DETAILS' }
  | { type: 'MUTE_SOUND'; payload: string }
  | { type: 'CLEAR_OLD_NOTIFICATIONS'; payload: number };

// Context state interface
interface NotificationContextState {
  notifications: NotificationState[];
  selectedEventDetails: CalendarEvent | null;
  isDetailsModalOpen: boolean;
}

// Context value interface (state + actions)
interface NotificationContextValue extends NotificationContextState {
  addNotification: (event: CalendarEvent) => void;
  dismissNotification: (notificationId: string) => void;
  showEventDetails: (notificationId: string) => void;
  hideEventDetails: () => void;
  muteSound: (notificationId: string) => void;
  clearOldNotifications: (maxAgeMs?: number) => void;
}

// Initial state
const initialState: NotificationContextState = {
  notifications: [],
  selectedEventDetails: null,
  isDetailsModalOpen: false,
};

// Reducer function
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
        return state;
      }
      // Limit to 10 notifications max (SC-004)
      const newNotifications = [...state.notifications, action.payload];
      if (newNotifications.length > 10) {
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
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (!notification) {
        return state;
      }
      // Get full event details from storage
      const event = getEventById(notification.eventId);
      return {
        ...state,
        selectedEventDetails: event,
        isDetailsModalOpen: true,
        // Dismiss the notification when showing details
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
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

    default:
      return state;
  }
}

// Create context
const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((event: CalendarEvent) => {
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Notifications] Added notification:', notification);
    }
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: notificationId });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Notifications] Dismissed notification:', notificationId);
    }
  }, []);

  const showEventDetails = useCallback((notificationId: string) => {
    dispatch({ type: 'SHOW_EVENT_DETAILS', payload: notificationId });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Notifications] Showing event details for:', notificationId);
    }
  }, []);

  const hideEventDetails = useCallback(() => {
    dispatch({ type: 'HIDE_EVENT_DETAILS' });
  }, []);

  const muteSound = useCallback((notificationId: string) => {
    dispatch({ type: 'MUTE_SOUND', payload: notificationId });
  }, []);

  const clearOldNotifications = useCallback((maxAgeMs: number = 300000) => {
    // Default: 5 minutes
    dispatch({ type: 'CLEAR_OLD_NOTIFICATIONS', payload: maxAgeMs });
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

// Custom hook to use notifications
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}
