import type { Settlement, Transaction, TransactionStatus, TransactionType } from '../../types';
import { BalanceCalculationService } from '../balance/BalanceCalculationService';

export interface CreateTransactionDTO {
  personId: string;
  type: TransactionType;
  amount: number;
  date: string;
  dueDate?: string;
  category: string;
  description?: string;
}

export interface CreateSettlementDTO {
  transactionId: string;
  amount: number;
  date: string;
  notes?: string;
}

/**
 * Service managing transaction lifecycle, validations, and settlement operations (SOLID: SRP)
 */
export class TransactionService {
  /**
   * Generates a collision-resistant unique ID
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Validates and creates a new Transaction object
   */
  static createTransaction(dto: CreateTransactionDTO): Transaction {
    const amount = BalanceCalculationService.round(dto.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Transaction amount must be greater than zero');
    }
    if (!dto.personId) {
      throw new Error('Transaction must be associated with a person');
    }

    const trimmedDesc = dto.description?.trim();
    const finalDescription =
      trimmedDesc ||
      (dto.category && dto.category !== 'General'
        ? dto.category
        : dto.type === 'LENT'
        ? 'Loan'
        : 'Borrowed');

    const now = new Date().toISOString();
    return {
      id: this.generateId(),
      personId: dto.personId,
      type: dto.type,
      amount,
      remainingAmount: amount,
      date: dto.date || now,
      dueDate: dto.dueDate || undefined,
      category: dto.category || 'General',
      description: finalDescription,
      status: 'PENDING',
      settlements: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Applies a settlement payment towards a transaction
   */
  static applySettlement(
    transaction: Transaction,
    dto: CreateSettlementDTO
  ): Transaction {
    const settleAmount = BalanceCalculationService.round(dto.amount);
    if (isNaN(settleAmount) || settleAmount <= 0) {
      throw new Error('Settlement amount must be greater than zero');
    }
    if (settleAmount > transaction.remainingAmount) {
      throw new Error(
        `Settlement amount (${settleAmount}) cannot exceed remaining balance (${transaction.remainingAmount})`
      );
    }

    const settlement: Settlement = {
      id: this.generateId(),
      transactionId: transaction.id,
      amount: settleAmount,
      date: dto.date || new Date().toISOString(),
      notes: dto.notes?.trim() || undefined,
    };

    const newRemaining = BalanceCalculationService.round(
      transaction.remainingAmount - settleAmount
    );

    let newStatus: TransactionStatus = 'PARTIALLY_PAID';
    if (newRemaining <= 0) {
      newStatus = 'SETTLED';
    }

    return {
      ...transaction,
      remainingAmount: Math.max(0, newRemaining),
      status: newStatus,
      settlements: [...transaction.settlements, settlement],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Settles the full remaining amount of a transaction
   */
  static settleFull(
    transaction: Transaction,
    date?: string,
    notes?: string
  ): Transaction {
    return this.applySettlement(transaction, {
      transactionId: transaction.id,
      amount: transaction.remainingAmount,
      date: date || new Date().toISOString(),
      notes: notes || 'Full settlement',
    });
  }
}
