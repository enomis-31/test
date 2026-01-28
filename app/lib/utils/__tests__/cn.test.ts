import { cn } from '../cn';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('should handle conditional classes', () => {
    expect(cn('px-2', true && 'py-1')).toBe('px-2 py-1');
    expect(cn('px-2', false && 'py-1')).toBe('px-2');
  });

  it('should resolve Tailwind conflicts', () => {
    // px-2 should be overridden by px-4
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle arrays', () => {
    expect(cn(['px-2', 'py-1'])).toBe('px-2 py-1');
  });

  it('should handle objects', () => {
    expect(cn({ 'px-2': true, 'py-1': false })).toBe('px-2');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });

  it('should handle mixed inputs', () => {
    expect(cn('px-2', ['py-1'], { 'text-red': true })).toBe('px-2 py-1 text-red');
  });
});
