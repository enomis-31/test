import { Card } from '@/app/types/user';
import { saveToStorage, loadFromStorage } from '@/app/lib/utils/storage';

const FILTER_STORAGE_KEY = 'user_filter';

/**
 * Service for managing user filter state and filtering cards.
 */
export class FilterService {
  /**
   * Filters cards array to show only cards assigned to the specified user.
   * @param cards - Array of all cards
   * @param userId - User ID to filter by, or null to show all cards
   * @returns Filtered array of cards
   */
  static getFilteredCards(cards: Card[], userId: string | null): Card[] {
    if (!userId) {
      return cards;
    }
    return cards.filter((card) => card.assignedUserId === userId);
  }

  /**
   * Saves the current filter selection to localStorage.
   * @param userId - User ID to save, or null/empty string to clear filter
   */
  static saveFilterToStorage(userId: string | null): void {
    const value = userId || '';
    saveToStorage(FILTER_STORAGE_KEY, value);
  }

  /**
   * Loads the saved filter selection from localStorage.
   * @returns User ID if filter exists, or null if no filter is saved
   */
  static loadFilterFromStorage(): string | null {
    const value = loadFromStorage<string>(FILTER_STORAGE_KEY, '');
    return value || null;
  }

  /**
   * Clears the filter by removing it from localStorage.
   */
  static clearFilter(): void {
    try {
      if (typeof window !== 'undefined' && isStorageAvailable()) {
        localStorage.removeItem(FILTER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('[FilterService] Failed to clear filter:', error);
    }
  }
}

/**
 * Helper function to check if localStorage is available.
 * @returns true if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
