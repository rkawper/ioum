import { describe, expect, it } from 'vitest';
import type { Person, Transaction } from '../../types';
import { BalanceCalculationService } from '../balance/BalanceCalculationService';

describe('BalanceCalculationService', () => {
  const mockPerson: Person = {
    id: 'p1',
    name: 'Alice',
    avatarColor: '#10b981',
    createdAt: new Date().toISOString(),
  };

  it('correctly rounds currency amounts', () => {
    expect(BalanceCalculationService.round(10.555)).toBe(10.56);
    expect(BalanceCalculationService.round(10.554)).toBe(10.55);
    expect(BalanceCalculationService.round(0.1 + 0.2)).toBe(0.3);
  });

  it('calculates overall portfolio summary correctly', () => {
    const transactions: Transaction[] = [
      {
        id: 't1',
        personId: 'p1',
        type: 'LENT',
        amount: 100,
        remainingAmount: 70, // 30 partially settled
        date: '2026-01-01',
        description: 'Dinner',
        status: 'PARTIALLY_PAID',
        settlements: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 't2',
        personId: 'p2',
        type: 'BORROWED',
        amount: 50,
        remainingAmount: 50,
        date: '2026-01-02',
        description: 'Taxi',
        status: 'PENDING',
        settlements: [],
        createdAt: '2026-01-02',
        updatedAt: '2026-01-02',
      },
      {
        id: 't3',
        personId: 'p3',
        type: 'LENT',
        amount: 40,
        remainingAmount: 0,
        date: '2026-01-03',
        description: 'Settled debt',
        status: 'SETTLED',
        settlements: [],
        createdAt: '2026-01-03',
        updatedAt: '2026-01-03',
      },
    ];

    const summary = BalanceCalculationService.calculateOverallSummary(transactions, 3);
    expect(summary.totalYouAreOwed).toBe(70);
    expect(summary.totalYouOwe).toBe(50);
    expect(summary.netBalance).toBe(20); // 70 - 50 = +20
    expect(summary.activeCount).toBe(2);
    expect(summary.settledCount).toBe(1);
    expect(summary.peopleCount).toBe(3);
  });

  it('calculates individual person balance summary', () => {
    const transactions: Transaction[] = [
      {
        id: 't1',
        personId: 'p1',
        type: 'LENT',
        amount: 100,
        remainingAmount: 100,
        date: '2026-01-01',
        description: 'Loan 1',
        status: 'PENDING',
        settlements: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 't2',
        personId: 'p1',
        type: 'BORROWED',
        amount: 30,
        remainingAmount: 30,
        date: '2026-01-02',
        description: 'Loan 2',
        status: 'PENDING',
        settlements: [],
        createdAt: '2026-01-02',
        updatedAt: '2026-01-02',
      },
    ];

    const balance = BalanceCalculationService.calculatePersonBalance(mockPerson, transactions);
    expect(balance.totalLent).toBe(100);
    expect(balance.totalBorrowed).toBe(30);
    expect(balance.netBalance).toBe(70); // they owe you 70
    expect(balance.activeCount).toBe(2);
  });
});
