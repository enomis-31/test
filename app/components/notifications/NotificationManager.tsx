import React, { useEffect } from 'react';
import { EventMonitor } from '../../lib/services/event-monitor';

const NotificationManager = () => {
  useEffect(() => {
    const monitor = new EventMonitor();
    monitor.startMonitoring();

    return () => {
      monitor.stopMonitoring();
    };
  }, []);

  return null;
};

export default NotificationManager;
