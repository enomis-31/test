import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/app/types/user';
import { FilterService } from '@/app/lib/services/filter-service';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('useUserFilter');

/**
 * Hook for managing user filter state with localStorage persistence.
 * @param cards - Array of all cards to filter
 * @returns Filter state and methods
 */
export function useUserFilter(cards: Card[]) {
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

  const clearFilter = () => {
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
