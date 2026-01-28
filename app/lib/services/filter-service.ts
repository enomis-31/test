import { Card } from '@/app/types/user';
import { saveToStorage, loadFromStorage } from '@/app/lib/utils/storage';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('FilterService');
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
    logger.debug('Filtering cards', {
      function: 'getFilteredCards',
      totalCards: cards.length,
      userId,
    });

    if (!userId) {
      logger.debug('No user filter, returning all cards', {
        function: 'getFilteredCards',
      });
      return cards;
    }

    const filtered = cards.filter((card) => card.assignedUserId === userId);
    
    logger.debug('Cards filtered', {
      function: 'getFilteredCards',
      totalCards: cards.length,
      filteredCount: filtered.length,
      userId,
    });

    return filtered;
  }

  /**
   * Saves the current filter selection to localStorage.
   * @param userId - User ID to save, or null/empty string to clear filter
   */
  static saveFilterToStorage(userId: string | null): void {
    logger.debug('Saving filter to storage', {
      function: 'saveFilterToStorage',
      userId,
    });

    const value = userId || '';
    saveToStorage(FILTER_STORAGE_KEY, value);

    logger.debug('Filter saved to storage', {
      function: 'saveFilterToStorage',
      userId,
    });
  }

  /**
   * Loads the saved filter selection from localStorage.
   * @returns User ID if filter exists, or null if no filter is saved
   */
  static loadFilterFromStorage(): string | null {
    logger.debug('Loading filter from storage', {
      function: 'loadFilterFromStorage',
    });

    const value = loadFromStorage<string>(FILTER_STORAGE_KEY, '');
    const result = value || null;

    logger.debug('Filter loaded from storage', {
      function: 'loadFilterFromStorage',
      userId: result,
    });

    return result;
  }

  /**
   * Clears the filter by removing it from localStorage.
   */
  static clearFilter(): void {
    logger.debug('Clearing filter', {
      function: 'clearFilter',
    });

    try {
      if (typeof window !== 'undefined' && isStorageAvailable()) {
        localStorage.removeItem(FILTER_STORAGE_KEY);
        logger.debug('Filter cleared successfully', {
          function: 'clearFilter',
        });
      } else {
        logger.warn('Cannot clear filter: storage not available', {
          function: 'clearFilter',
        });
      }
    } catch (error) {
      logger.error('Failed to clear filter', error, {
        function: 'clearFilter',
      });
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
