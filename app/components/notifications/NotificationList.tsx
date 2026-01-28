'use client';

import React from 'react';
import { NotificationState } from '@/app/types/event';
import { NotificationPopup } from './NotificationPopup';
import { cn } from '@/app/lib/utils/cn';

interface NotificationListProps {
  notifications: NotificationState[];
  onDismiss: (id: string) => void;
  onShowDetails: (id: string) => void;
  onMuteSound?: (id: string) => void;
}

export function NotificationList({
  notifications,
  onDismiss,
  onShowDetails,
  onMuteSound,
}: NotificationListProps) {
  // Filter out dismissed notifications and limit to 10 (SC-004)
  const activeNotifications = notifications
    .filter((n) => !n.isDismissed)
    .slice(0, 10);

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50',
        'flex flex-col gap-3',
        'w-full max-w-sm',
        // Mobile positioning
        'xs:top-4 xs:right-4',
        'left-4 xs:left-auto'
      )}
      role="region"
      aria-label="Notifications"
    >
      {activeNotifications.map((notification) => (
        <NotificationPopup
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
          onShowDetails={onShowDetails}
          onMuteSound={onMuteSound}
        />
      ))}
    </div>
  );
}
