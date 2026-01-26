import React, { useState } from 'react';
import { NotificationState } from '../hooks/use-notifications';

interface NotificationPopupProps {
  notification: NotificationState;
  onDismiss: () => void;
  onShowDetails: (id: string) => void;
}

const NotificationPopup = ({
  notification,
  onDismiss,
  onShowDetails,
}: NotificationPopupProps) => {
  const [isDetailsShown, setIsDetailsShown] = useState(false);

  return (
    <div className="notification-popup">
      <h2>{notification.eventTitle}</h2>
      <p>Start Time: {notification.eventStartTime}</p>
      <button onClick={onDismiss}>Dismiss</button>
      <button onClick={() => onShowDetails(notification.id)}>View Details</button>
      {isDetailsShown && (
        <EventDetailsModal
          isOpen={true}
          onClose={() => setIsDetailsShown(false)}
        />
      )}
    </div>
  );
};

export default NotificationPopup;
