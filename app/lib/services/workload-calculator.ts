import { Card, User, UserWorkload } from '@/app/types/user';

/**
 * Service for calculating user workloads based on card assignments.
 */
export class WorkloadCalculator {
  /**
   * Calculates workloads for all users based on their assigned cards.
   * @param cards - Array of all cards
   * @param users - Array of all users
   * @returns Map of userId to UserWorkload
   */
  static calculateUserWorkloads(
    cards: Card[],
    users: User[]
  ): Map<string, UserWorkload> {
    const workloadMap = new Map<string, UserWorkload>();

    // Initialize workloads for all users (including users with 0 cards)
    users.forEach((user) => {
      workloadMap.set(user.id, {
        userId: user.id,
        cardCount: 0,
        status: 'OK',
        hasIndicator: false,
      });
    });

    // Count cards per user
    cards.forEach((card) => {
      if (card.assignedUserId) {
        const workload = workloadMap.get(card.assignedUserId);
        if (workload) {
          workload.cardCount += 1;
        } else {
          // User not in users list but has cards assigned - create workload entry
          workloadMap.set(card.assignedUserId, {
            userId: card.assignedUserId,
            cardCount: 1,
            status: 'OK',
            hasIndicator: false,
          });
        }
      }
    });

    // Calculate status and indicator flags
    workloadMap.forEach((workload) => {
      workload.status = workload.cardCount > 3 ? 'Busy' : 'OK';
      workload.hasIndicator = workload.cardCount > 3;
    });

    return workloadMap;
  }

  /**
   * Gets the workload for a specific user.
   * @param userId - User ID to get workload for
   * @param cards - Array of all cards
   * @param users - Array of all users (to ensure user exists)
   * @returns UserWorkload object, or null if user not found
   */
  static getUserWorkload(
    userId: string,
    cards: Card[],
    users: User[]
  ): UserWorkload | null {
    const workloads = this.calculateUserWorkloads(cards, users);
    return workloads.get(userId) || null;
  }

  /**
   * Gets the status for a specific user based on their card count.
   * @param userId - User ID to get status for
   * @param cards - Array of all cards
   * @param users - Array of all users (to ensure user exists)
   * @returns "OK" or "Busy", or null if user not found
   */
  static getUserStatus(
    userId: string,
    cards: Card[],
    users: User[]
  ): 'OK' | 'Busy' | null {
    const workload = this.getUserWorkload(userId, cards, users);
    return workload ? workload.status : null;
  }
}
