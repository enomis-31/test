'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Bell, Volume2, VolumeX, Clock } from 'lucide-react';
import { NotificationState } from '@/app/types/event';
import { formatEventTime } from '@/app/lib/utils/date-utils';
import { cn } from '@/app/lib/utils/cn';
import { Button } from '@/app/components/ui/button';

/**
 * Props for the NotificationPopup component.
 */
interface NotificationPopupProps {
  /** Notification state object containing event information and display state */
  notification: NotificationState;
  /** Callback function called when the notification is dismissed */
  onDismiss: (id: string) => void;
  /** Callback function called when the notification is clicked to show event details */
  onShowDetails: (id: string) => void;
  /** Optional callback function called when sound is muted for this notification */
  onMuteSound?: (id: string) => void;
}

export function NotificationPopup({
  notification,
  onDismiss,
  onShowDetails,
  onMuteSound,
}: NotificationPopupProps) {
  /**
   * Handles dismiss button click event.
   * @param e - Mouse event from the dismiss button
   */
  const handleDismiss = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.stopPropagation();
      onDismiss(notification.id);
    },
    [notification.id, onDismiss]
  );

  /**
   * Handles notification click to show event details.
   */
  const handleClick = useCallback((): void => {
    onShowDetails(notification.id);
  }, [notification.id, onShowDetails]);

  /**
   * Handles mute sound button click event.
   * @param e - Mouse event from the mute button
   */
  const handleMute = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.stopPropagation();
      if (onMuteSound) {
        onMuteSound(notification.id);
      }
    },
    [notification.id, onMuteSound]
  );

  /**
   * Handles keyboard navigation for the notification.
   * Enter key shows details, Escape key dismisses.
   * @param e - Keyboard event
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === 'Enter') {
        onShowDetails(notification.id);
      } else if (e.key === 'Escape') {
        onDismiss(notification.id);
      }
    },
    [notification.id, onShowDetails, onDismiss]
  );

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative w-full max-w-sm cursor-pointer',
        'bg-card border border-border rounded-lg shadow-lg',
        'p-4 pr-12',
        'transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.02]',
        'animate-slide-in-from-top',
        // Touch-friendly target size
        'min-h-[64px]'
      )}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          'absolute top-2 right-2',
          'p-2 rounded-md',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-muted',
          'transition-colors',
          // 44x44px touch target
          'min-w-[44px] min-h-[44px]',
          'flex items-center justify-center'
        )}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <Bell className="h-5 w-5 text-primary" />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {notification.eventTitle}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatEventTime(notification.eventStartTime)}</span>
          </div>
        </div>

        {/* Sound mute button */}
        {onMuteSound && !notification.isSoundMuted && (
          <button
            type="button"
            onClick={handleMute}
            className={cn(
              'flex-shrink-0 p-2 rounded-md',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-muted',
              'transition-colors',
              'min-w-[44px] min-h-[44px]',
              'flex items-center justify-center'
            )}
            aria-label="Mute sound"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        )}
        {notification.isSoundMuted && (
          <div className="flex-shrink-0 p-2 text-muted-foreground">
            <VolumeX className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Click hint */}
      <p className="mt-2 text-xs text-muted-foreground">
        Click to view details
      </p>
    </div>
  );
}
