import type { Person, Transaction } from '../../types';

export interface CreatePersonDTO {
  name: string;
  avatarColor?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
];

/**
 * Service managing Person entities (SOLID: SRP)
 */
export class PersonService {
  static getRandomColor(): string {
    const idx = Math.floor(Math.random() * AVATAR_COLORS.length);
    return AVATAR_COLORS[idx];
  }

  static createPerson(dto: CreatePersonDTO): Person {
    const trimmedName = dto.name.trim();
    if (!trimmedName) {
      throw new Error('Person name is required');
    }

    return {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: trimmedName,
      avatarColor: dto.avatarColor || this.getRandomColor(),
      phone: dto.phone?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      notes: dto.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Checks whether a person has any active (unsettled) transactions
   */
  static hasActiveBalance(personId: string, transactions: Transaction[]): boolean {
    return transactions.some(
      (tx) => tx.personId === personId && tx.status !== 'SETTLED' && tx.remainingAmount > 0
    );
  }
}
