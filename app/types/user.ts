/**
 * Represents a team member or assignee who can be assigned to cards and filtered in the board view.
 */
export interface User {
  /** Unique identifier for the user. Used for filtering and card assignment. */
  id: string;
  /** Display name of the user. Shown in filter dropdown and board header. */
  name: string;
}

/**
 * Represents a task or work item on the Kanban board that can be assigned to a user and filtered.
 */
export interface Card {
  /** Unique identifier for the card. */
  id: string;
  /** ID of the user assigned to this card. Single user only. If null/undefined, card is unassigned. */
  assignedUserId?: string | null;
  /** Card title/name. */
  title: string;
  /** ID of the column the card is in (for board organization). */
  columnId?: string;
}

/**
 * Represents the calculated workload state for a user based on their assigned cards.
 */
export interface UserWorkload {
  /** Reference to User ID. */
  userId: string;
  /** Number of cards assigned to this user. Calculated by counting cards where assignedUserId === userId. */
  cardCount: number;
  /** Workload status. Values: "OK" (cardCount ≤ 3), "Busy" (cardCount > 3). */
  status: 'OK' | 'Busy';
  /** Whether workload indicator should be displayed. True when cardCount > 3. */
  hasIndicator: boolean;
}

/**
 * Represents the current user filter selection state.
 */
export interface FilterState {
  /** ID of the currently selected user for filtering. If null, no filter is active (show all cards). */
  selectedUserId: string | null;
  /** Filtered cards array based on selectedUserId. */
  filteredCards: Card[];
  /** Whether filter is currently active. True when selectedUserId !== null. */
  isFilterActive: boolean;
}
