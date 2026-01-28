import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/app/types/user';
import { FilterService } from '@/app/lib/services/filter-service';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('useUserFilter');

/**
 * Return type for the useUserFilter hook.
 */
export interface UseUserFilterReturn {
  /** Currently selected user ID for filtering, or null if no filter is active */
  selectedUserId: string | null;
  /** Function to set the selected user ID (pass null to clear filter) */
  setSelectedUserId: (userId: string | null) => void;
  /** Filtered array of cards based on selectedUserId */
  filteredCards: Card[];
  /** Whether a filter is currently active (true when selectedUserId !== null) */
  isFilterActive: boolean;
  /** Function to clear the current filter (sets selectedUserId to null) */
  clearFilter: () => void;
}

/**
 * Hook for managing user filter state with localStorage persistence.
 * Automatically saves filter selection to localStorage and restores it on mount.
 * @param cards - Array of all cards to filter
 * @returns Object containing filter state and methods:
 *   - selectedUserId: Currently selected user ID or null
 *   - setSelectedUserId: Function to update the selected user ID
 *   - filteredCards: Filtered array of cards based on selectedUserId
 *   - isFilterActive: Boolean indicating if filter is active
 *   - clearFilter: Function to clear the current filter
 */
export function useUserFilter(cards: Card[]): UseUserFilterReturn {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(() => {
    // Load saved filter from localStorage on mount
    try {
      if (typeof window !== 'undefined') {
        return FilterService.loadFilterFromStorage();
      }
      return null;
    } catch (error) {
      logger.error('Failed to load filter from storage on mount', error, {
        function: 'useUserFilter[initialState]',
      });
      // Fail loud: return null but log error clearly
      return null;
    }
  });

  // Save filter to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (selectedUserId) {
          FilterService.saveFilterToStorage(selectedUserId);
        } else {
          FilterService.clearFilter();
        }
      }
    } catch (error) {
      logger.error('Failed to save filter to storage', error, {
        function: 'useUserFilter[useEffect]',
        selectedUserId,
      });
      // Fail loud: log error but don't throw to prevent breaking the UI
    }
  }, [selectedUserId]);

  // Calculate filtered cards using useMemo for performance
  const filteredCards = useMemo(() => {
    return FilterService.getFilteredCards(cards, selectedUserId);
  }, [cards, selectedUserId]);

  // Computed filter state
  const isFilterActive = selectedUserId !== null;

  /**
   * Clears the current filter by setting selectedUserId to null.
   */
  const clearFilter = (): void => {
    setSelectedUserId(null);
  };

  return {
    selectedUserId,
    setSelectedUserId,
    filteredCards,
    isFilterActive,
    clearFilter,
  };
}
