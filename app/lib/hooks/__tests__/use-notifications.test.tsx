import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../use-notifications';
import { CalendarEvent } from '@/app/types/event';
import * as storage from '@/app/lib/utils/storage';

jest.mock('@/app/lib/utils/storage');

describe('useNotifications', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  const mockEvent: CalendarEvent = {
    id: 'event1',
    title: 'Test Event',
    startTime: '2026-01-28T12:00:00Z',
    description: 'Test description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(storage, 'getEventById').mockReturnValue(mockEvent);
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.selectedEventDetails).toBeNull();
    expect(result.current.isDetailsModalOpen).toBe(false);
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification(mockEvent);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].eventId).toBe(mockEvent.id);
    expect(result.current.notifications[0].eventTitle).toBe(mockEvent.title);
  });

  it('should prevent duplicate notifications', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification(mockEvent);
      result.current.addNotification(mockEvent);
    });

    expect(result.current.notifications).toHaveLength(1);
  });

  it('should limit notifications to 10', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addNotification({
          ...mockEvent,
          id: `event${i}`,
          title: `Event ${i}`,
        });
      }
    });

    expect(result.current.notifications).toHaveLength(10);
  });

  it('should dismiss notification', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification(mockEvent);
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.dismissNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should show event details', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification(mockEvent);
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.showEventDetails(notificationId);
    });

    expect(result.current.isDetailsModalOpen).toBe(true);
    expect(result.current.selectedEventDetails).toEqual(mockEvent);
    expect(result.current.notifications).toHaveLength(0); // Should dismiss notification
  });

  it('should hide event details', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification(mockEvent);
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.showEventDetails(notificationId);
      result.current.hideEventDetails();
    });

    expect(result.current.isDetailsModalOpen).toBe(false);
    expect(result.current.selectedEventDetails).toBeNull();
  });

  it('should mute sound for notification', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification(mockEvent);
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.muteSound(notificationId);
    });

    expect(result.current.notifications[0].isSoundMuted).toBe(true);
  });

  it('should clear old notifications', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    const oldEvent: CalendarEvent = {
      ...mockEvent,
      id: 'old-event',
    };

    // Add notification at time 0
    act(() => {
      result.current.addNotification(oldEvent);
    });

    // Advance time by 10 minutes
    act(() => {
      jest.advanceTimersByTime(600000); // 10 minutes
      result.current.clearOldNotifications(300000); // 5 minutes max age
    });

    expect(result.current.notifications).toHaveLength(0);
    
    jest.useRealTimers();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useNotifications());
    }).toThrow('useNotifications must be used within a NotificationProvider');

    consoleSpy.mockRestore();
  });
});
