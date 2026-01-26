import { useState, useCallback } from 'react';

interface NotificationState {
  id: string;
  eventId: string;
  eventTitle: string;
  eventStartTime: string;
  triggeredAt: number;
  isDismissed: boolean;
  isSoundMuted: boolean;
  isDetailsShown: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const addNotification = useCallback((notification: NotificationState) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDismissed: true } : n))
    );
  }, []);

  const showEventDetails = useCallback((id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      // Show event details modal
      setIsDetailsShown(true);
    }
  }, [notifications]);

  return {
    notifications,
    addNotification,
    dismissNotification,
    showEventDetails,
  };
};
