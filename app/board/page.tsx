'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, User } from '@/app/types/user';
import { useUserFilter } from '@/app/lib/hooks/use-user-filter';
import { UserFilter } from '@/app/components/board/UserFilter';
import { loadFromStorage, saveToStorage } from '@/app/lib/utils/storage';
import { WorkloadCalculator } from '@/app/lib/services/workload-calculator';

// Storage keys
const STORAGE_KEY_CARDS = 'kanban_cards';
const STORAGE_KEY_USERS = 'kanban_users';

/**
 * Default users for demonstration
 */
const DEFAULT_USERS: User[] = [
  { id: 'user-1', name: 'Alice' },
  { id: 'user-2', name: 'Bob' },
  { id: 'user-3', name: 'Charlie' },
];

/**
 * Board page component with user filtering functionality.
 */
export default function BoardPage() {
  // Load users from storage or use defaults
  const [users] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = loadFromStorage<User[]>(STORAGE_KEY_USERS, DEFAULT_USERS);
      return saved;
    }
    return DEFAULT_USERS;
  });

  // Load cards from storage
  const [cards, setCards] = useState<Card[]>(() => {
    if (typeof window !== 'undefined') {
      return loadFromStorage<Card[]>(STORAGE_KEY_CARDS, []);
    }
    return [];
  });

  // Save cards to storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && cards.length >= 0) {
      saveToStorage(STORAGE_KEY_CARDS, cards);
    }
  }, [cards]);

  // Use the filter hook
  const {
    selectedUserId,
    setSelectedUserId,
    filteredCards,
    isFilterActive,
    clearFilter,
  } = useUserFilter(cards);

  // Calculate workloads for all users
  const workloads = useMemo(() => {
    return WorkloadCalculator.calculateUserWorkloads(cards, users);
  }, [cards, users]);

  // Get selected user name for display
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => u.id === selectedUserId) || null;
  }, [selectedUserId, users]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Kanban Board</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isFilterActive && selectedUser
                ? `Showing cards assigned to ${selectedUser.name}`
                : 'Showing all cards'}
            </p>
          </div>
          <UserFilter
            users={users}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
            onClearFilter={clearFilter}
            workloads={workloads}
          />
        </div>

        {/* Cards Display */}
        <div className="space-y-4">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground px-4">
                {isFilterActive
                  ? 'No cards assigned to the selected user.'
                  : 'No cards available. Add some cards to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredCards.map((card) => {
                const assignedUser = users.find(
                  (u) => u.id === card.assignedUserId
                );
                return (
                  <div
                    key={card.id}
                    className="border rounded-lg p-3 sm:p-4 bg-card hover:shadow-md transition-shadow touch-manipulation"
                    role="article"
                    aria-label={`Card: ${card.title}`}
                  >
                    <h3 className="font-semibold text-base sm:text-lg mb-2">{card.title}</h3>
                    {assignedUser && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Assigned to: {assignedUser.name}
                      </p>
                    )}
                    {!assignedUser && (
                      <p className="text-xs sm:text-sm text-muted-foreground italic">
                        Unassigned
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Debug Info (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-xs space-y-1">
            <p>
              <strong>Total cards:</strong> {cards.length}
            </p>
            <p>
              <strong>Filtered cards:</strong> {filteredCards.length}
            </p>
            <p>
              <strong>Filter active:</strong> {isFilterActive ? 'Yes' : 'No'}
            </p>
            {selectedUserId && (
              <p>
                <strong>Selected user:</strong> {selectedUserId}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
