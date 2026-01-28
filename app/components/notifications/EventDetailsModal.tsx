'use client';

import React, { useEffect, useCallback } from 'react';
import { CalendarEvent } from '@/app/types/event';
import { formatEventDateTime } from '@/app/lib/utils/date-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Props for the EventDetailsModal component.
 */
interface EventDetailsModalProps {
  /** Calendar event to display details for, or null if no event is selected */
  event: CalendarEvent | null;
  /** Whether the modal is currently open and visible */
  isOpen: boolean;
  /** Callback function called when the modal should be closed */
  onClose: () => void;
  /** Optional flag indicating if event data is currently being loaded */
  isLoading?: boolean;
  /** Optional error message to display if event loading failed */
  error?: string | null;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
  isLoading = false,
  error = null,
}: EventDetailsModalProps) {
  /**
   * Handles Escape key press to close the modal.
   * @param e - Keyboard event
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-md mx-4 sm:mx-auto"
        aria-labelledby="event-details-title"
        aria-describedby="event-details-description"
      >
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="sr-only">Loading event details...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}

        {/* Content when event is available */}
        {event && !isLoading && !error && (
          <>
            <DialogHeader>
              <DialogTitle 
                id="event-details-title"
                className="flex items-center gap-2"
              >
                <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                {event.title}
              </DialogTitle>
              <DialogDescription id="event-details-description">
                Event Details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Scheduled Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventDateTime(event.startTime)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}

              {/* No description message */}
              {!event.description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground italic">
                      No description available
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </>
        )}

        {/* Empty state */}
        {!event && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Event not found</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
