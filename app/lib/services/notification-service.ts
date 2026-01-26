import { NotificationState } from '../hooks/use-notifications';

export class NotificationService {
  triggerNotification(event: any) {
    // Create a new notification state object
    const notificationState: NotificationState = {
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

    // Play sound when notification triggers
    this.playNotificationSound();
  }

  playNotificationSound() {
    // Get the audio file URL from localStorage
    const audioFileUrl = localStorage.getItem('notification_sound');
    if (audioFileUrl) {
      // Create an Audio object and play the sound
      const audio = new Audio(audioFileUrl);
      audio.play();
    }
  }

  muteNotificationSound(notificationId: string) {
    // Update the notification state to mute the sound
    const dispatch = (action: any) => {
      console.log('Dispatching action:', action);
    };
    dispatch({ type: 'MUTE_NOTIFICATION_SOUND', payload: notificationId });
  }
}
