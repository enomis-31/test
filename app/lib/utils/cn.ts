import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes.
 * Combines clsx for conditional classes and twMerge to resolve Tailwind class conflicts.
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns Merged class string with resolved Tailwind conflicts
 * @example
 * ```ts
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-2 is overridden by px-4)
 * cn('bg-red-500', isActive && 'bg-blue-500') // Returns 'bg-blue-500' if isActive is true
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
