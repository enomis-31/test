'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '@/app/lib/hooks/use-notifications';
import { getEventMonitor } from '@/app/lib/services/event-monitor';
import {
  playNotificationSound,
  setupAudioOnUserInteraction,
} from '@/app/lib/services/notification-service';
import { CalendarEvent } from '@/app/types/event';
import { NotificationList } from './NotificationList';
import { EventDetailsModal } from './EventDetailsModal';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('NotificationManager');

/**
 * NotificationManager component.
 * Initializes event monitoring and renders notifications.
 */
export function NotificationManager() {
  const {
    notifications,
    addNotification,
    dismissNotification,
    showEventDetails,
    hideEventDetails,
    muteSound,
    selectedEventDetails,
    isDetailsModalOpen,
    clearOldNotifications,
  } = useNotifications();

  const isInitialized = useRef(false);
  const eventMonitorRef = useRef(getEventMonitor());

  // Handle notification callback
  const handleNotification = useCallback(
    async (event: CalendarEvent) => {
      logger.info('Handling notification for event', {
        function: 'handleNotification',
        eventId: event.id,
        eventTitle: event.title,
      });

      // Add notification to state
      addNotification(event);

      // Play sound
      try {
        await playNotificationSound();
        logger.debug('Notification sound played successfully', {
          function: 'handleNotification',
          eventId: event.id,
        });
      } catch (error) {
        // Fail loud: log error with full context
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Sound playback failed - notification will still be shown', error, {
          function: 'handleNotification',
          eventId: event.id,
          eventTitle: event.title,
          errorMessage,
        });
        // Don't throw - notification should still be displayed even if sound fails
      }
    },
    [addNotification]
  );

  // Check if tab is visible
  const isTabActive = useCallback(() => {
    if (typeof document === 'undefined') {
      return false;
    }
    return document.visibilityState === 'visible';
  }, []);

  // Initialize event monitoring
  useEffect(() => {
    logger.debug('NotificationManager effect running', {
      function: 'useEffect[init]',
      isInitialized: isInitialized.current,
    });

    if (isInitialized.current) {
      logger.debug('Already initialized, skipping', {
        function: 'useEffect[init]',
      });
      return;
    }

    logger.info('Initializing NotificationManager', {
      function: 'useEffect[init]',
    });

    isInitialized.current = true;

    // Set up audio on user interaction
    setupAudioOnUserInteraction();

    // Configure event monitor
    const monitor = eventMonitorRef.current;
    monitor.setNotificationCallback(handleNotification);
    monitor.setVisibilityCallback(isTabActive);

    // Start monitoring
    monitor.startMonitoring();

    logger.info('NotificationManager initialized and monitoring started', {
      function: 'useEffect[init]',
    });

    // Cleanup on unmount
    return () => {
      logger.info('Cleaning up NotificationManager', {
        function: 'useEffect[cleanup]',
      });
      monitor.stopMonitoring();
    };
  }, [handleNotification, isTabActive]);

  // Clean up old notifications periodically
  useEffect(() => {
    logger.debug('Setting up periodic notification cleanup', {
      function: 'useEffect[cleanup]',
    });

    const cleanupInterval = setInterval(() => {
      logger.debug('Running periodic notification cleanup', {
        function: 'useEffect[cleanup]',
      });
      clearOldNotifications(300000); // 5 minutes
    }, 60000); // Check every minute

    return () => {
      logger.debug('Clearing periodic notification cleanup interval', {
        function: 'useEffect[cleanup]',
      });
      clearInterval(cleanupInterval);
    };
  }, [clearOldNotifications]);

  // Handle visibility change - trigger check when tab becomes active
  useEffect(() => {
    logger.debug('Setting up visibility change listener', {
      function: 'useEffect[visibility]',
    });

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      logger.debug('Visibility state changed', {
        function: 'handleVisibilityChange',
        isVisible,
      });

      if (isVisible) {
        // Trigger an immediate check when tab becomes active
        logger.debug('Tab became visible, triggering immediate check', {
          function: 'handleVisibilityChange',
        });
        eventMonitorRef.current.triggerCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      logger.debug('Removing visibility change listener', {
        function: 'useEffect[visibility]',
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <NotificationList
        notifications={notifications}
        onDismiss={dismissNotification}
        onShowDetails={showEventDetails}
        onMuteSound={muteSound}
      />
      <EventDetailsModal
        event={selectedEventDetails}
        isOpen={isDetailsModalOpen}
        onClose={hideEventDetails}
      />
    </>
  );
}
