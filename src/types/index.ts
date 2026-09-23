export type TransactionType = 'LENT' | 'BORROWED';

export type TransactionStatus = 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';

export interface Settlement {
  id: string;
  transactionId: string;
  amount: number;
  date: string; // ISO 8601
  notes?: string;
}

export interface Transaction {
  id: string;
  personId: string;
  type: TransactionType;
  amount: number;
  remainingAmount: number;
  date: string; // ISO 8601
  dueDate?: string; // ISO 8601 YYYY-MM-DD
  category: string;
  description?: string;
  status: TransactionStatus;
  settlements: Settlement[];
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  name: string;
  avatarColor: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface PersonBalanceSummary {
  person: Person;
  totalLent: number;
  totalBorrowed: number;
  netBalance: number; // positive = they owe you, negative = you owe them
  activeCount: number;
  settledCount: number;
}

export interface OverallSummary {
  totalYouAreOwed: number; // Lent to others and not fully settled
  totalYouOwe: number;     // Borrowed from others and not fully settled
  netBalance: number;      // totalYouAreOwed - totalYouOwe
  activeCount: number;
  settledCount: number;
  peopleCount: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type SortOption =
  | 'DATE_DESC'
  | 'DATE_ASC'
  | 'AMOUNT_DESC'
  | 'AMOUNT_ASC'
  | 'DUE_DATE';

export interface FilterState {
  type: 'ALL' | TransactionType;
  status: 'ALL' | 'ACTIVE' | 'SETTLED';
  personId: 'ALL' | string;
  searchQuery: string;
  sortBy: SortOption;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  currency: Currency;
  persons: Person[];
  transactions: Transaction[];
}
