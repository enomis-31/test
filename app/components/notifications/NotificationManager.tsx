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
      // Add notification to state
      addNotification(event);

      // Play sound
      try {
        await playNotificationSound();
      } catch (error) {
        console.warn('[NotificationManager] Sound playback failed:', error);
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
    if (isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    // Set up audio on user interaction
    setupAudioOnUserInteraction();

    // Configure event monitor
    const monitor = eventMonitorRef.current;
    monitor.setNotificationCallback(handleNotification);
    monitor.setVisibilityCallback(isTabActive);

    // Start monitoring
    monitor.startMonitoring();

    if (process.env.NODE_ENV === 'development') {
      console.log('[NotificationManager] Initialized and monitoring started');
    }

    // Cleanup on unmount
    return () => {
      monitor.stopMonitoring();
    };
  }, [handleNotification, isTabActive]);

  // Clean up old notifications periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      clearOldNotifications(300000); // 5 minutes
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, [clearOldNotifications]);

  // Handle visibility change - trigger check when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Trigger an immediate check when tab becomes active
        eventMonitorRef.current.triggerCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
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
