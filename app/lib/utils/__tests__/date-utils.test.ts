import {
  isEventTimeInWindow,
  formatEventTime,
  formatEventDateTime,
  getCurrentTime,
  getCurrentTimeISO,
  generateNotificationId,
  getMinutesUntilEvent,
} from '../date-utils';

describe('date-utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('isEventTimeInWindow', () => {
    it('should return true when event time is exactly now', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      const eventTime = now.toISOString();
      
      expect(isEventTimeInWindow(eventTime, 5)).toBe(true);
    });

    it('should return true when event time is within window before now', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      const eventTime = new Date('2026-01-28T11:59:57Z').toISOString(); // 3 seconds before
      
      expect(isEventTimeInWindow(eventTime, 5)).toBe(true);
    });

    it('should return true when event time is within window after now', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      const eventTime = new Date('2026-01-28T12:00:03Z').toISOString(); // 3 seconds after
      
      expect(isEventTimeInWindow(eventTime, 5)).toBe(true);
    });

    it('should return false when event time is outside window', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      const eventTime = new Date('2026-01-28T12:00:10Z').toISOString(); // 10 seconds after
      
      expect(isEventTimeInWindow(eventTime, 5)).toBe(false);
    });

    it('should return false for invalid date string', () => {
      expect(isEventTimeInWindow('invalid-date', 5)).toBe(false);
    });

    it('should handle custom window size', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      const eventTime = new Date('2026-01-28T12:00:10Z').toISOString(); // 10 seconds after
      
      expect(isEventTimeInWindow(eventTime, 15)).toBe(true);
    });

    it('should return false for invalid eventStartTime type', () => {
      // @ts-expect-error - testing invalid input
      expect(isEventTimeInWindow(null, 5)).toBe(false);
    });

    it('should return false for negative windowSeconds', () => {
      expect(isEventTimeInWindow('2026-01-28T12:00:00Z', -1)).toBe(false);
    });
  });

  describe('formatEventTime', () => {
    it('should format valid ISO date string correctly', () => {
      const result = formatEventTime('2026-01-28T14:30:00Z');
      expect(result).toBe('14:30');
    });

    it('should return "Invalid time" for invalid date string', () => {
      const result = formatEventTime('invalid-date');
      expect(result).toBe('Invalid time');
    });

    it('should return "Invalid time" for null input', () => {
      // @ts-expect-error - testing invalid input
      expect(formatEventTime(null)).toBe('Invalid time');
    });
  });

  describe('formatEventDateTime', () => {
    it('should format valid ISO date string correctly', () => {
      const result = formatEventDateTime('2026-01-28T14:30:00Z');
      expect(result).toMatch(/Jan 28, 2026 at 14:30/);
    });

    it('should return "Invalid date" for invalid date string', () => {
      const result = formatEventDateTime('invalid-date');
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for null input', () => {
      // @ts-expect-error - testing invalid input
      expect(formatEventDateTime(null)).toBe('Invalid date');
    });
  });

  describe('getCurrentTime', () => {
    it('should return current timestamp', () => {
      const now = Date.now();
      jest.setSystemTime(now);
      expect(getCurrentTime()).toBe(now);
    });
  });

  describe('getCurrentTimeISO', () => {
    it('should return current time as ISO string', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      expect(getCurrentTimeISO()).toBe(now.toISOString());
    });
  });

  describe('generateNotificationId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateNotificationId();
      jest.advanceTimersByTime(1);
      const id2 = generateNotificationId();
      
      expect(id1).toMatch(/^notif-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^notif-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('getMinutesUntilEvent', () => {
    it('should return positive minutes for future event', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      const eventTime = new Date('2026-01-28T12:15:00Z').toISOString(); // 15 minutes later
      
      expect(getMinutesUntilEvent(eventTime)).toBe(15);
    });

    it('should return negative minutes for past event', () => {
      const now = new Date('2026-01-28T12:00:00Z');
      jest.setSystemTime(now);
      const eventTime = new Date('2026-01-28T11:45:00Z').toISOString(); // 15 minutes earlier
      
      expect(getMinutesUntilEvent(eventTime)).toBe(-15);
    });

    it('should return 0 for invalid date string', () => {
      expect(getMinutesUntilEvent('invalid-date')).toBe(0);
    });

    it('should return 0 for null input', () => {
      // @ts-expect-error - testing invalid input
      expect(getMinutesUntilEvent(null)).toBe(0);
    });
  });
});
