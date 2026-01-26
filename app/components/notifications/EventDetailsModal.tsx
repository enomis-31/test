import React, { useState, useEffect } from 'react';
import { NotificationState } from '../hooks/use-notifications';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsModal = ({ isOpen, onClose }: EventDetailsModalProps) => {
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const { notifications } = useNotifications();

  useEffect(() => {
    if (isOpen && event) {
      // Fetch event details from localStorage
      const storedEvents = JSON.parse(localStorage.getItem('calendar_events') || '[]');
      const matchingEvent = storedEvents.find((e) => e.id === event.eventId);
      setEvent(matchingEvent);
    }
  }, [isOpen, event]);

  if (!event) return null;

  return (
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content">
        <h2>{event.title}</h2>
        <p>Start Time: {event.startTime}</p>
        <p>Description: {event.description || 'No description available'}</p>
      </div>
      <button className="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default EventDetailsModal;
