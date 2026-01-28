'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { saveEventToStorage, getEventsFromStorage } from '@/app/lib/utils/storage';
import { CalendarEvent } from '@/app/types/event';
import { Bell, Plus, Trash2, Calendar } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== 'undefined') {
      return getEventsFromStorage();
    }
    return [];
  });

  const refreshEvents = () => {
    setEvents(getEventsFromStorage());
  };

  const addTestEvent = (minutesFromNow: number) => {
    const now = new Date();
    const eventTime = new Date(now.getTime() + minutesFromNow * 60000);
    
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: `Test Event (${minutesFromNow} min${minutesFromNow !== 1 ? 's' : ''})`,
      startTime: eventTime.toISOString(),
      description: `This is a test event scheduled for ${eventTime.toLocaleTimeString()}`,
      createdAt: now.toISOString(),
    };

    saveEventToStorage(event);
    refreshEvents();
  };

  const clearAllEvents = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('calendar_events');
      refreshEvents();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Calendar Notifications</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Keep this app open to receive notifications when events are due.
          </p>
        </div>

        {/* Quick Add Section */}
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Test Event
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTestEvent(1)}
            >
              +1 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTestEvent(2)}
            >
              +2 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTestEvent(5)}
            >
              +5 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTestEvent(10)}
            >
              +10 min
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Events will trigger notifications when their time arrives.
          </p>
        </div>

        {/* Events List */}
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Events ({events.length})
            </h2>
            {events.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllEvents}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No events scheduled. Add a test event above.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.map((event) => {
                const eventDate = new Date(event.startTime);
                const isPast = eventDate < new Date();
                return (
                  <div
                    key={event.id}
                    className={`p-3 rounded-md border ${
                      isPast ? 'bg-muted/50 opacity-60' : 'bg-background'
                    }`}
                  >
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {eventDate.toLocaleString()}
                      {isPast && ' (past)'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={refreshEvents}
            className="w-full"
          >
            Refresh List
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Notifications check every 60 seconds.</p>
          <p>Events trigger within ±5 seconds of their scheduled time.</p>
        </div>
      </div>
    </main>
  );
}
