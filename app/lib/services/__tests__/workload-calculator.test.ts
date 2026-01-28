import { WorkloadCalculator } from '../workload-calculator';
import { Card, User } from '@/app/types/user';

describe('WorkloadCalculator', () => {
  const mockUsers: User[] = [
    { id: 'user1', name: 'User 1' },
    { id: 'user2', name: 'User 2' },
    { id: 'user3', name: 'User 3' },
  ];

  describe('calculateUserWorkloads', () => {
    it('should calculate workloads for all users', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', assignedUserId: 'user1' },
        { id: '2', title: 'Card 2', assignedUserId: 'user1' },
        { id: '3', title: 'Card 3', assignedUserId: 'user2' },
      ];

      const workloads = WorkloadCalculator.calculateUserWorkloads(cards, mockUsers);

      expect(workloads.size).toBe(3);
      expect(workloads.get('user1')?.cardCount).toBe(2);
      expect(workloads.get('user2')?.cardCount).toBe(1);
      expect(workloads.get('user3')?.cardCount).toBe(0);
    });

    it('should set status to OK when cardCount <= 3', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', assignedUserId: 'user1' },
        { id: '2', title: 'Card 2', assignedUserId: 'user1' },
        { id: '3', title: 'Card 3', assignedUserId: 'user1' },
      ];

      const workloads = WorkloadCalculator.calculateUserWorkloads(cards, mockUsers);

      expect(workloads.get('user1')?.status).toBe('OK');
      expect(workloads.get('user1')?.hasIndicator).toBe(false);
    });

    it('should set status to Busy when cardCount > 3', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', assignedUserId: 'user1' },
        { id: '2', title: 'Card 2', assignedUserId: 'user1' },
        { id: '3', title: 'Card 3', assignedUserId: 'user1' },
        { id: '4', title: 'Card 4', assignedUserId: 'user1' },
        { id: '5', title: 'Card 5', assignedUserId: 'user1' },
      ];

      const workloads = WorkloadCalculator.calculateUserWorkloads(cards, mockUsers);

      expect(workloads.get('user1')?.status).toBe('Busy');
      expect(workloads.get('user1')?.hasIndicator).toBe(true);
    });

    it('should include users with 0 cards', () => {
      const cards: Card[] = [];

      const workloads = WorkloadCalculator.calculateUserWorkloads(cards, mockUsers);

      expect(workloads.size).toBe(3);
      expect(workloads.get('user1')?.cardCount).toBe(0);
      expect(workloads.get('user2')?.cardCount).toBe(0);
      expect(workloads.get('user3')?.cardCount).toBe(0);
    });

    it('should handle unassigned cards', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', assignedUserId: null },
        { id: '2', title: 'Card 2' },
      ];

      const workloads = WorkloadCalculator.calculateUserWorkloads(cards, mockUsers);

      expect(workloads.get('user1')?.cardCount).toBe(0);
      expect(workloads.get('user2')?.cardCount).toBe(0);
    });

    it('should create workload entry for unknown user with cards', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', assignedUserId: 'unknown-user' },
      ];

      const workloads = WorkloadCalculator.calculateUserWorkloads(cards, mockUsers);

      expect(workloads.has('unknown-user')).toBe(true);
      expect(workloads.get('unknown-user')?.cardCount).toBe(1);
    });
  });

  describe('getUserWorkload', () => {
    it('should return workload for existing user', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', assignedUserId: 'user1' },
        { id: '2', title: 'Card 2', assignedUserId: 'user1' },
      ];

      const workload = WorkloadCalculator.getUserWorkload('user1', cards, mockUsers);

      expect(workload).not.toBeNull();
      expect(workload?.cardCount).toBe(2);
      expect(workload?.userId).toBe('user1');
    });

    it('should return null for non-existent user', () => {
      const cards: Card[] = [];

      const workload = WorkloadCalculator.getUserWorkload('non-existent', cards, mockUsers);

      expect(workload).toBeNull();
    });
  });

  describe('getUserStatus', () => {
    it('should return OK for user with <= 3 cards', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', assignedUserId: 'user1' },
        { id: '2', title: 'Card 2', assignedUserId: 'user1' },
        { id: '3', title: 'Card 3', assignedUserId: 'user1' },
      ];

      const status = WorkloadCalculator.getUserStatus('user1', cards, mockUsers);

      expect(status).toBe('OK');
    });

    it('should return Busy for user with > 3 cards', () => {
      const cards: Card[] = [
        { id: '1', title: 'Card 1', assignedUserId: 'user1' },
        { id: '2', title: 'Card 2', assignedUserId: 'user1' },
        { id: '3', title: 'Card 3', assignedUserId: 'user1' },
        { id: '4', title: 'Card 4', assignedUserId: 'user1' },
      ];

      const status = WorkloadCalculator.getUserStatus('user1', cards, mockUsers);

      expect(status).toBe('Busy');
    });

    it('should return null for non-existent user', () => {
      const cards: Card[] = [];

      const status = WorkloadCalculator.getUserStatus('non-existent', cards, mockUsers);

      expect(status).toBeNull();
    });
  });
});
