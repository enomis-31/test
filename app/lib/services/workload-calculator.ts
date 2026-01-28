import { Card, User, UserWorkload } from '@/app/types/user';
import { createLogger } from '@/app/lib/utils/logger';

const logger = createLogger('WorkloadCalculator');

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
    logger.debug('Calculating user workloads', {
      function: 'calculateUserWorkloads',
      cardCount: cards.length,
      userCount: users.length,
    });

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
    let unassignedCards = 0;
    cards.forEach((card) => {
      if (card.assignedUserId) {
        const workload = workloadMap.get(card.assignedUserId);
        if (workload) {
          workload.cardCount += 1;
        } else {
          // User not in users list but has cards assigned - create workload entry
          logger.debug('Card assigned to unknown user, creating workload entry', {
            function: 'calculateUserWorkloads',
            cardId: card.id,
            assignedUserId: card.assignedUserId,
          });
          workloadMap.set(card.assignedUserId, {
            userId: card.assignedUserId,
            cardCount: 1,
            status: 'OK',
            hasIndicator: false,
          });
        }
      } else {
        unassignedCards++;
      }
    });

    // Calculate status and indicator flags
    let busyUsers = 0;
    workloadMap.forEach((workload) => {
      workload.status = workload.cardCount > 3 ? 'Busy' : 'OK';
      workload.hasIndicator = workload.cardCount > 3;
      if (workload.hasIndicator) {
        busyUsers++;
      }
    });

    logger.info('User workloads calculated', {
      function: 'calculateUserWorkloads',
      totalUsers: workloadMap.size,
      busyUsers,
      unassignedCards,
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
    logger.debug('Getting user workload', {
      function: 'getUserWorkload',
      userId,
    });

    const workloads = this.calculateUserWorkloads(cards, users);
    const workload = workloads.get(userId) || null;

    logger.debug('User workload retrieved', {
      function: 'getUserWorkload',
      userId,
      found: !!workload,
      cardCount: workload?.cardCount ?? 0,
    });

    return workload;
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
    logger.debug('Getting user status', {
      function: 'getUserStatus',
      userId,
    });

    const workload = this.getUserWorkload(userId, cards, users);
    const status = workload ? workload.status : null;

    logger.debug('User status retrieved', {
      function: 'getUserStatus',
      userId,
      status,
    });

    return status;
  }
}
