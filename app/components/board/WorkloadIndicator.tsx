'use client';

import { Badge } from '@/app/components/ui/badge';

/**
 * Props for the WorkloadIndicator component.
 */
interface WorkloadIndicatorProps {
  /** Number of cards assigned to the user */
  cardCount: number;
  /** Whether to show the indicator badge (should be true when cardCount > 3) */
  show?: boolean;
}

/**
 * Visual indicator component that displays when a user has more than 3 cards assigned.
 * Shows a badge with card count and color highlight.
 * Non-blocking and does not interrupt workflow.
 */
export function WorkloadIndicator({
  cardCount,
  show,
}: WorkloadIndicatorProps) {
  // Only show if explicitly enabled and cardCount > 3
  if (!show || cardCount <= 3) {
    return null;
  }

  return (
    <Badge
      className="bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-100 text-xs sm:text-xs px-2 py-0.5 touch-manipulation"
      variant="outline"
      aria-label={`User has ${cardCount} cards assigned (overloaded)`}
      role="status"
    >
      {cardCount} cards
    </Badge>
  );
}
