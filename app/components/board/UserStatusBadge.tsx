'use client';

import { Badge } from '@/app/components/ui/badge';

interface UserStatusBadgeProps {
  /** User status: "OK" or "Busy" */
  status: 'OK' | 'Busy';
}

/**
 * Component that displays user status (OK/Busy) based on workload.
 * Shows "OK" in green when user has 3 or fewer cards.
 * Shows "Busy" in orange/red when user has more than 3 cards.
 */
export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const isBusy = status === 'Busy';

  return (
    <Badge
      className={
        isBusy
          ? 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-100 text-xs sm:text-xs px-2 py-0.5 touch-manipulation'
          : 'bg-green-100 border-green-300 text-green-800 hover:bg-green-100 text-xs sm:text-xs px-2 py-0.5 touch-manipulation'
      }
      variant="outline"
      aria-label={`User status: ${status}`}
      role="status"
    >
      {status}
    </Badge>
  );
}
