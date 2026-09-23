import type { BackupData, Currency, Person, Transaction } from '../../types';

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
];

export const DEFAULT_CURRENCY = DEFAULT_CURRENCIES[0];

/**
 * Service managing export, import, and demo data (SOLID: SRP)
 */
export class BackupService {
  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * Generates a BackupData payload
   */
  static generateBackup(
    persons: Person[],
    transactions: Transaction[],
    currency: Currency
  ): BackupData {
    return {
      version: this.CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      currency,
      persons,
      transactions,
    };
  }

  /**
   * Triggers browser download of backup JSON
   */
  static downloadBackupFile(backup: BackupData): void {
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `ioum-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates and parses an imported JSON backup string
   */
  static parseAndValidateBackup(rawJson: string): BackupData {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error('Invalid JSON format');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid backup structure: root must be an object');
    }

    const data = parsed as Record<string, unknown>;

    if (!Array.isArray(data.persons)) {
      throw new Error('Invalid backup file: "persons" must be an array');
    }

    if (!Array.isArray(data.transactions)) {
      throw new Error('Invalid backup file: "transactions" must be an array');
    }

    // Validate persons
    const persons: Person[] = [];
    for (const p of data.persons) {
      if (typeof p !== 'object' || !p || typeof p.id !== 'string' || typeof p.name !== 'string') {
        throw new Error('Invalid person entry in backup file');
      }
      persons.push({
        id: p.id,
        name: p.name,
        avatarColor: typeof p.avatarColor === 'string' ? p.avatarColor : '#3b82f6',
        phone: typeof p.phone === 'string' ? p.phone : undefined,
        email: typeof p.email === 'string' ? p.email : undefined,
        notes: typeof p.notes === 'string' ? p.notes : undefined,
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
      });
    }

    // Validate transactions
    const transactions: Transaction[] = [];
    for (const t of data.transactions) {
      if (
        typeof t !== 'object' ||
        !t ||
        typeof t.id !== 'string' ||
        typeof t.personId !== 'string' ||
        (t.type !== 'LENT' && t.type !== 'BORROWED') ||
        typeof t.amount !== 'number'
      ) {
        throw new Error('Invalid transaction entry in backup file');
      }
      transactions.push({
        id: t.id,
        personId: t.personId,
        type: t.type,
        amount: t.amount,
        remainingAmount: typeof t.remainingAmount === 'number' ? t.remainingAmount : t.amount,
        date: typeof t.date === 'string' ? t.date : new Date().toISOString(),
        dueDate: typeof t.dueDate === 'string' ? t.dueDate : undefined,
        description: typeof t.description === 'string' ? t.description : 'Transaction',
        status: (['PENDING', 'PARTIALLY_PAID', 'SETTLED'].includes(t.status as string)
          ? t.status
          : 'PENDING') as Transaction['status'],
        settlements: Array.isArray(t.settlements) ? t.settlements : [],
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
        updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : new Date().toISOString(),
      });
    }

    // Validate currency
    let currency: Currency = DEFAULT_CURRENCIES[0];
    if (data.currency && typeof data.currency === 'object') {
      const c = data.currency as Record<string, unknown>;
      if (typeof c.code === 'string' && typeof c.symbol === 'string' && typeof c.name === 'string') {
        currency = { code: c.code, symbol: c.symbol, name: c.name };
      }
    }

    return {
      version: typeof data.version === 'string' ? data.version : this.CURRENT_VERSION,
      exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : new Date().toISOString(),
      currency,
      persons,
      transactions,
    };
  }

  /**
   * Generates realistic sample data for instant exploration
   */
  static getSampleData(): { persons: Person[]; transactions: Transaction[] } {
    const now = new Date();
    const daysAgo = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d.toISOString();
    };
    const daysFuture = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const persons: Person[] = [
      {
        id: 'p-sarah',
        name: 'Sarah Connor',
        avatarColor: '#10b981',
        phone: '+1 555-0192',
        email: 'sarah@example.com',
        notes: 'Roommate',
        createdAt: daysAgo(30),
      },
      {
        id: 'p-alex',
        name: 'Alex Rivera',
        avatarColor: '#3b82f6',
        phone: '+1 555-0144',
        email: 'alex.r@example.com',
        notes: 'Work colleague',
        createdAt: daysAgo(20),
      },
      {
        id: 'p-maya',
        name: 'Maya Patel',
        avatarColor: '#8b5cf6',
        phone: '+1 555-0177',
        notes: 'College friend',
        createdAt: daysAgo(15),
      },
      {
        id: 'p-david',
        name: 'David Kim',
        avatarColor: '#f59e0b',
        email: 'dkim@example.com',
        notes: 'Weekend hiking buddy',
        createdAt: daysAgo(10),
      },
    ];

    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        personId: 'p-sarah',
        type: 'LENT',
        amount: 85.0,
        remainingAmount: 85.0,
        date: daysAgo(5),
        dueDate: daysFuture(10),
        description: 'Dinner at Italian Bistro & dessert',
        status: 'PENDING',
        settlements: [],
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
      },
      {
        id: 'tx-2',
        personId: 'p-alex',
        type: 'BORROWED',
        amount: 45.0,
        remainingAmount: 45.0,
        date: daysAgo(8),
        dueDate: daysFuture(5),
        description: 'Airport ride share split',
        status: 'PENDING',
        settlements: [],
        createdAt: daysAgo(8),
        updatedAt: daysAgo(8),
      },
      {
        id: 'tx-3',
        personId: 'p-maya',
        type: 'LENT',
        amount: 150.0,
        remainingAmount: 50.0,
        date: daysAgo(14),
        dueDate: daysFuture(3),
        description: 'Concert tickets front row',
        status: 'PARTIALLY_PAID',
        settlements: [
          {
            id: 'stl-1',
            transactionId: 'tx-3',
            amount: 100.0,
            date: daysAgo(2),
            notes: 'Cash payment part 1',
          },
        ],
        createdAt: daysAgo(14),
        updatedAt: daysAgo(2),
      },
      {
        id: 'tx-4',
        personId: 'p-david',
        type: 'BORROWED',
        amount: 30.0,
        remainingAmount: 0.0,
        date: daysAgo(12),
        description: 'Hiking gear batteries and trail snacks',
        status: 'SETTLED',
        settlements: [
          {
            id: 'stl-2',
            transactionId: 'tx-4',
            amount: 30.0,
            date: daysAgo(4),
            notes: 'Venmo transfer',
          },
        ],
        createdAt: daysAgo(12),
        updatedAt: daysAgo(4),
      },
    ];

    return { persons, transactions };
  }
}
