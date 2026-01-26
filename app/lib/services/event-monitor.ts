import { useEffect, useState } from 'react';

const POLLING_INTERVAL = 60 * 1000; // 60 seconds

export class EventMonitor {
  private intervalId: NodeJS.Timeout | null = null;

  startMonitoring() {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const windowStart = now - 5000;
      const windowEnd = now + 5000;

      const events = JSON.parse(localStorage.getItem('calendar_events') || '[]');
      let matchingEvents = events.filter((event: any) => {
        const eventTime = new Date(event.startTime).getTime();
        return eventTime >= windowStart && eventTime <= windowEnd;
      });

      // Filter out notified events
      const notifiedEvents = localStorage.getItem('notified_events');
      if (notifiedEvents) {
        const notifiedEventIds = JSON.parse(notifiedEvents);
        matchingEvents = matchingEvents.filter((event: any) => !notifiedEventIds.includes(event.id));
      }

      // Trigger notifications for new events
      matchingEvents.forEach((event: any) => {
        this.triggerNotification(event);
      });
    }, POLLING_INTERVAL);

    // Check if browser tab is active before triggering notifications
    const visibilityChange = () => {
      if (document.visibilityState === 'visible') {
        this.intervalId = setInterval(() => {
          // ...
        }, POLLING_INTERVAL);
      } else {
        clearInterval(this.intervalId);
      }
    };
    document.addEventListener('visibilitychange', visibilityChange);

    return () => {
      clearInterval(this.intervalId);
      document.removeEventListener('visibilitychange', visibilityChange);
    };
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private triggerNotification(event: any) {
    // Create a new notification state object
    const notificationState = {
      id: event.id,
      eventId: event.id,
      eventTitle: event.title,
      eventStartTime: event.startTime,
      triggeredAt: Date.now(),
      isDismissed: false,
      isSoundMuted: false,
      isDetailsShown: false,
    };

    // Dispatch the ADD_NOTIFICATION action
    const dispatch = (action: any) => {
      console.log('Dispatching action:', action);
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationState });

    // Store the notified event ID in localStorage
    const notifiedEvents = localStorage.getItem('notified_events');
    if (!notifiedEvents) {
      localStorage.setItem('notified_events', JSON.stringify([event.id]));
    } else {
      const notifiedEventIds = JSON.parse(notifiedEvents);
      notifiedEventIds.push(event.id);
      localStorage.setItem('notified_events', JSON.stringify(notifiedEventIds));
    }
  }
}
