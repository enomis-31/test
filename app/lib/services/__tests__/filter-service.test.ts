import { FilterService } from '../filter-service';
import { Card } from '@/app/types/user';
import * as storage from '@/app/lib/utils/storage';

jest.mock('@/app/lib/utils/storage');

describe('FilterService', () => {
  const mockCards: Card[] = [
    { id: '1', title: 'Card 1', assignedUserId: 'user1' },
    { id: '2', title: 'Card 2', assignedUserId: 'user1' },
    { id: '3', title: 'Card 3', assignedUserId: 'user2' },
    { id: '4', title: 'Card 4', assignedUserId: null },
    { id: '5', title: 'Card 5' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('getFilteredCards', () => {
    it('should return all cards when userId is null', () => {
      const result = FilterService.getFilteredCards(mockCards, null);
      expect(result).toEqual(mockCards);
    });

    it('should filter cards by userId', () => {
      const result = FilterService.getFilteredCards(mockCards, 'user1');
      expect(result).toHaveLength(2);
      expect(result.every(card => card.assignedUserId === 'user1')).toBe(true);
    });

    it('should return empty array when no cards match userId', () => {
      const result = FilterService.getFilteredCards(mockCards, 'user999');
      expect(result).toEqual([]);
    });

    it('should handle empty cards array', () => {
      const result = FilterService.getFilteredCards([], 'user1');
      expect(result).toEqual([]);
    });
  });

  describe('saveFilterToStorage', () => {
    it('should save userId to storage', () => {
      FilterService.saveFilterToStorage('user1');
      
      expect(storage.saveToStorage).toHaveBeenCalledWith('user_filter', 'user1');
    });

    it('should save empty string when userId is null', () => {
      FilterService.saveFilterToStorage(null);
      
      expect(storage.saveToStorage).toHaveBeenCalledWith('user_filter', '');
    });
  });

  describe('loadFilterFromStorage', () => {
    it('should load userId from storage', () => {
      jest.spyOn(storage, 'loadFromStorage').mockReturnValue('user1');
      
      const result = FilterService.loadFilterFromStorage();
      
      expect(result).toBe('user1');
      expect(storage.loadFromStorage).toHaveBeenCalledWith('user_filter', '');
    });

    it('should return null when no filter saved', () => {
      jest.spyOn(storage, 'loadFromStorage').mockReturnValue('');
      
      const result = FilterService.loadFilterFromStorage();
      
      expect(result).toBeNull();
    });
  });

  describe('clearFilter', () => {
    it('should remove filter from localStorage', () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
      
      FilterService.clearFilter();
      
      expect(removeItemSpy).toHaveBeenCalledWith('user_filter');
    });

    it('should handle errors gracefully', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw, but log error
      expect(() => FilterService.clearFilter()).not.toThrow();
    });
  });
});
