import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useUserFilter } from '../use-user-filter';
import { Card } from '@/app/types/user';
import * as filterService from '@/app/lib/services/filter-service';

jest.mock('@/app/lib/services/filter-service');

describe('useUserFilter', () => {
  const mockCards: Card[] = [
    { id: '1', title: 'Card 1', assignedUserId: 'user1' },
    { id: '2', title: 'Card 2', assignedUserId: 'user1' },
    { id: '3', title: 'Card 3', assignedUserId: 'user2' },
    { id: '4', title: 'Card 4', assignedUserId: null },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(filterService.FilterService, 'loadFilterFromStorage').mockReturnValue(null);
    jest.spyOn(filterService.FilterService, 'getFilteredCards').mockImplementation(
      (cards, userId) => {
        if (!userId) return cards;
        return cards.filter(card => card.assignedUserId === userId);
      }
    );
    jest.spyOn(filterService.FilterService, 'saveFilterToStorage').mockImplementation(() => {});
    jest.spyOn(filterService.FilterService, 'clearFilter').mockImplementation(() => {});
  });

  it('should initialize with no filter', () => {
    const { result } = renderHook(() => useUserFilter(mockCards));

    expect(result.current.selectedUserId).toBeNull();
    expect(result.current.isFilterActive).toBe(false);
    expect(result.current.filteredCards).toEqual(mockCards);
  });

  it('should load filter from storage on mount', () => {
    jest.spyOn(filterService.FilterService, 'loadFilterFromStorage').mockReturnValue('user1');

    const { result } = renderHook(() => useUserFilter(mockCards));

    expect(result.current.selectedUserId).toBe('user1');
    expect(result.current.isFilterActive).toBe(true);
  });

  it('should filter cards by userId', () => {
    const { result } = renderHook(() => useUserFilter(mockCards));

    act(() => {
      result.current.setSelectedUserId('user1');
    });

    expect(result.current.selectedUserId).toBe('user1');
    expect(result.current.isFilterActive).toBe(true);
    expect(filterService.FilterService.getFilteredCards).toHaveBeenCalledWith(mockCards, 'user1');
  });

  it('should clear filter', () => {
    const { result } = renderHook(() => useUserFilter(mockCards));

    act(() => {
      result.current.setSelectedUserId('user1');
      result.current.clearFilter();
    });

    expect(result.current.selectedUserId).toBeNull();
    expect(result.current.isFilterActive).toBe(false);
  });

  it('should save filter to storage when changed', () => {
    const { result } = renderHook(() => useUserFilter(mockCards));

    act(() => {
      result.current.setSelectedUserId('user1');
    });

    expect(filterService.FilterService.saveFilterToStorage).toHaveBeenCalledWith('user1');
  });

  it('should clear filter from storage when set to null', () => {
    const { result } = renderHook(() => useUserFilter(mockCards));

    act(() => {
      result.current.setSelectedUserId('user1');
      result.current.setSelectedUserId(null);
    });

    expect(filterService.FilterService.clearFilter).toHaveBeenCalled();
  });

  it('should handle storage errors gracefully', () => {
    jest.spyOn(filterService.FilterService, 'loadFilterFromStorage').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useUserFilter(mockCards));

    expect(result.current.selectedUserId).toBeNull();
  });

  it('should update filteredCards when cards change', () => {
    const { result, rerender } = renderHook(
      ({ cards }) => useUserFilter(cards),
      { initialProps: { cards: mockCards } }
    );

    act(() => {
      result.current.setSelectedUserId('user1');
    });

    const newCards: Card[] = [
      ...mockCards,
      { id: '5', title: 'Card 5', assignedUserId: 'user1' },
    ];

    rerender({ cards: newCards });

    expect(filterService.FilterService.getFilteredCards).toHaveBeenCalledWith(newCards, 'user1');
  });
});
