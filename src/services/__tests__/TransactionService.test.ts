import { describe, expect, it } from 'vitest';
import { TransactionService } from '../transaction/TransactionService';

describe('TransactionService', () => {
  it('creates transaction with valid inputs', () => {
    const tx = TransactionService.createTransaction({
      personId: 'p-1',
      type: 'LENT',
      amount: 50.5,
      date: '2026-02-01',
      description: 'Lunch treat',
    });

    expect(tx.id).toBeDefined();
    expect(tx.personId).toBe('p-1');
    expect(tx.amount).toBe(50.5);
    expect(tx.remainingAmount).toBe(50.5);
    expect(tx.status).toBe('PENDING');
    expect(tx.settlements).toHaveLength(0);
  });

  it('throws error for invalid amount or empty fields', () => {
    expect(() =>
      TransactionService.createTransaction({
        personId: 'p-1',
        type: 'LENT',
        amount: 0,
        date: '2026-02-01',
        description: 'Lunch',
      })
    ).toThrow('Transaction amount must be greater than zero');

    expect(() =>
      TransactionService.createTransaction({
        personId: '',
        type: 'LENT',
        amount: 20,
        date: '2026-02-01',
        description: 'Lunch',
      })
    ).toThrow('Transaction must be associated with a person');
  });

  it('allows optional description and falls back to Loan/Borrowed', () => {
    const txLent = TransactionService.createTransaction({
      personId: 'p-1',
      type: 'LENT',
      amount: 50,
      date: '2026-02-01',
    });
    expect(txLent.description).toBe('Loan');

    const txBorrowed = TransactionService.createTransaction({
      personId: 'p-1',
      type: 'BORROWED',
      amount: 30,
      date: '2026-02-01',
    });
    expect(txBorrowed.description).toBe('Borrowed');

    const txWithDesc = TransactionService.createTransaction({
      personId: 'p-1',
      type: 'LENT',
      amount: 50,
      date: '2026-02-01',
      description: 'Dinner treat',
    });
    expect(txWithDesc.description).toBe('Dinner treat');
  });

  it('defaults date to current time when omitted', () => {
    const before = Date.now();
    const tx = TransactionService.createTransaction({
      personId: 'p-1',
      type: 'LENT',
      amount: 25,
    });
    const after = Date.now();
    const txTime = new Date(tx.date).getTime();
    expect(txTime).toBeGreaterThanOrEqual(before);
    expect(txTime).toBeLessThanOrEqual(after);
  });

  it('applies partial settlement correctly', () => {
    const tx = TransactionService.createTransaction({
      personId: 'p-1',
      type: 'LENT',
      amount: 100,
      date: '2026-02-01',
      description: 'Groceries',
    });

    const partiallyPaid = TransactionService.applySettlement(tx, {
      transactionId: tx.id,
      amount: 40,
      date: '2026-02-05',
      notes: 'First installment',
    });

    expect(partiallyPaid.remainingAmount).toBe(60);
    expect(partiallyPaid.status).toBe('PARTIALLY_PAID');
    expect(partiallyPaid.settlements).toHaveLength(1);
    expect(partiallyPaid.settlements[0].amount).toBe(40);
  });

  it('applies full settlement and marks status SETTLED', () => {
    const tx = TransactionService.createTransaction({
      personId: 'p-1',
      type: 'BORROWED',
      amount: 80,
      date: '2026-02-01',
      description: 'Utilities share',
    });

    const settled = TransactionService.settleFull(tx, '2026-02-10', 'Paid via cash');
    expect(settled.remainingAmount).toBe(0);
    expect(settled.status).toBe('SETTLED');
    expect(settled.settlements).toHaveLength(1);
    expect(settled.settlements[0].amount).toBe(80);
  });

  it('rejects settlement amount higher than remaining balance', () => {
    const tx = TransactionService.createTransaction({
      personId: 'p-1',
      type: 'LENT',
      amount: 50,
      date: '2026-02-01',
      description: 'Book',
    });

    expect(() =>
      TransactionService.applySettlement(tx, {
        transactionId: tx.id,
        amount: 60,
        date: '2026-02-02',
      })
    ).toThrow('cannot exceed remaining balance');
  });
});
