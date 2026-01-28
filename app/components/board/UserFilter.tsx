'use client';

import { User, UserWorkload } from '@/app/types/user';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';
import { WorkloadIndicator } from './WorkloadIndicator';
import { UserStatusBadge } from './UserStatusBadge';

interface UserFilterProps {
  users: User[];
  selectedUserId: string | null;
  onUserSelect: (userId: string | null) => void;
  onClearFilter: () => void;
  /** Workload data for users - Map of userId to UserWorkload */
  workloads?: Map<string, UserWorkload>;
}

/**
 * Component for filtering the Kanban board by user.
 * Displays a dropdown to select a user and a button to clear the filter.
 */
export function UserFilter({
  users,
  selectedUserId,
  onUserSelect,
  onClearFilter,
  workloads,
}: UserFilterProps) {
  // Get workload for selected user
  const selectedUserWorkload = selectedUserId
    ? workloads?.get(selectedUserId)
    : null;

  return (
    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
      <div className="flex items-center gap-2 flex-wrap flex-1 sm:flex-initial">
        <Select
          value={selectedUserId || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              onUserSelect(null);
            } else {
              onUserSelect(value);
            }
          }}
        >
          <SelectTrigger 
            className="w-full xs:w-[200px] sm:w-[250px] touch-manipulation" 
            aria-label="Filter by user"
          >
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id} className="touch-manipulation">
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Display user status badge next to filter when user is selected */}
        {selectedUserWorkload && (
          <UserStatusBadge status={selectedUserWorkload.status} />
        )}
        {/* Display workload indicator next to filter when user is selected */}
        {selectedUserWorkload && (
          <WorkloadIndicator
            cardCount={selectedUserWorkload.cardCount}
            show={selectedUserWorkload.hasIndicator}
          />
        )}
      </div>
      {selectedUserId && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilter}
          aria-label="Clear filter"
          className="flex items-center gap-1 touch-manipulation w-full sm:w-auto justify-center"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
