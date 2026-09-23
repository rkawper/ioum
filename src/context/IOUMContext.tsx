import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Currency, OverallSummary, Person, PersonBalanceSummary, ThemeMode, Transaction } from '../types';
import { BalanceCalculationService } from '../services/balance/BalanceCalculationService';
import { BackupService, DEFAULT_CURRENCIES } from '../services/backup/BackupService';
import { type CreatePersonDTO, PersonService } from '../services/person/PersonService';
import type { IStorageRepository } from '../services/storage/IStorageRepository';
import { LocalStorageRepository } from '../services/storage/LocalStorageRepository';
import { type CreateTransactionDTO, TransactionService } from '../services/transaction/TransactionService';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface IOUMContextValue {
  persons: Person[];
  transactions: Transaction[];
  personSummaries: PersonBalanceSummary[];
  overallSummary: OverallSummary;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  toasts: ToastInfo[];
  removeToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Person actions
  addPerson: (dto: CreatePersonDTO) => Promise<Person>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (personId: string) => Promise<void>;

  // Transaction actions
  addTransaction: (dto: CreateTransactionDTO) => Promise<Transaction>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  settleTransaction: (
    transactionId: string,
    amount: number,
    notes?: string,
    date?: string
  ) => Promise<void>;
  settleFullTransaction: (
    transactionId: string,
    notes?: string,
    date?: string
  ) => Promise<void>;

  // Data management
  exportData: () => void;
  importData: (jsonStr: string) => Promise<void>;
  loadDemoData: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const IOUMContext = createContext<IOUMContextValue | null>(null);

const PERSONS_STORAGE_KEY = 'ioum_persons_v1';
const TRANSACTIONS_STORAGE_KEY = 'ioum_transactions_v1';
const CURRENCY_STORAGE_KEY = 'ioum_currency_v1';
const THEME_STORAGE_KEY = 'ioum_theme_v1';

// Stable singleton repository instances to avoid infinite re-render loops
const defaultPersonRepo = new LocalStorageRepository<Person>(PERSONS_STORAGE_KEY);
const defaultTransactionRepo = new LocalStorageRepository<Transaction>(TRANSACTIONS_STORAGE_KEY);

export interface IOUMProviderProps {
  children: React.ReactNode;
  personRepo?: IStorageRepository<Person>;
  transactionRepo?: IStorageRepository<Transaction>;
}

export const IOUMProvider: React.FC<IOUMProviderProps> = ({
  children,
  personRepo = defaultPersonRepo,
  transactionRepo = defaultTransactionRepo,
}) => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCIES[0]);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'system';
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  // Listen to OS prefers-color-scheme changes dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sync resolvedTheme to documentElement class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    // Quick toggle cycling: 'system' -> 'light' -> 'dark' -> 'system'
    const nextTheme: ThemeMode =
      theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(nextTheme);
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(c));
    } catch {
      // Ignore
    }
    showToast(`Currency changed to ${c.code} (${c.symbol})`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    let isCancelled = false;
    const loadInitialData = async () => {
      try {
        const [loadedPersons, loadedTransactions] = await Promise.all([
          personRepo.getAll(),
          transactionRepo.getAll(),
        ]);
        if (isCancelled) return;

        const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (savedCurrency) {
          try {
            setCurrencyState(JSON.parse(savedCurrency));
          } catch {
            // fallback
          }
        }

        setPersons(loadedPersons);
        setTransactions(loadedTransactions);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
    return () => {
      isCancelled = true;
    };
  }, [personRepo, transactionRepo]);

  // Derived summaries using pure BalanceCalculationService
  const overallSummary = useMemo(() => {
    return BalanceCalculationService.calculateOverallSummary(transactions, persons.length);
  }, [transactions, persons.length]);

  const personSummaries = useMemo(() => {
    return BalanceCalculationService.calculateAllPersonBalances(persons, transactions);
  }, [persons, transactions]);

  // Person CRUD
  const addPerson = async (dto: CreatePersonDTO): Promise<Person> => {
    const newPerson = PersonService.createPerson(dto);
    await personRepo.save(newPerson);
    setPersons((prev) => [...prev, newPerson]);
    showToast(`Added "${newPerson.name}"`, 'success');
    return newPerson;
  };

  const updatePerson = async (person: Person): Promise<void> => {
    await personRepo.save(person);
    setPersons((prev) => prev.map((p) => (p.id === person.id ? person : p)));
    showToast(`Updated "${person.name}"`, 'success');
  };

  const deletePerson = async (personId: string): Promise<void> => {
    const person = persons.find((p) => p.id === personId);
    if (!person) return;

    // Remove associated transactions
    const txsToDelete = transactions.filter((t) => t.personId === personId);
    for (const tx of txsToDelete) {
      await transactionRepo.delete(tx.id);
    }
    await personRepo.delete(personId);

    setTransactions((prev) => prev.filter((t) => t.personId !== personId));
    setPersons((prev) => prev.filter((p) => p.id !== personId));
    showToast(`Deleted "${person.name}"`, 'info');
  };

  // Transaction CRUD
  const addTransaction = async (dto: CreateTransactionDTO): Promise<Transaction> => {
    const newTx = TransactionService.createTransaction(dto);
    await transactionRepo.save(newTx);
    setTransactions((prev) => [newTx, ...prev]);
    const person = persons.find((p) => p.id === newTx.personId);
    const label = newTx.type === 'LENT' ? 'Lent to' : 'Borrowed from';
    showToast(`${label} ${person?.name || 'person'} recorded!`, 'success');
    return newTx;
  };

  const updateTransaction = async (transaction: Transaction): Promise<void> => {
    await transactionRepo.save(transaction);
    setTransactions((prev) => prev.map((t) => (t.id === transaction.id ? transaction : t)));
    showToast('Transaction updated', 'success');
  };

  const deleteTransaction = async (transactionId: string): Promise<void> => {
    await transactionRepo.delete(transactionId);
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    showToast('Transaction deleted', 'info');
  };

  const settleTransaction = async (
    transactionId: string,
    amount: number,
    notes?: string,
    date?: string
  ): Promise<void> => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) throw new Error('Transaction not found');

    const updated = TransactionService.applySettlement(tx, {
      transactionId,
      amount,
      date: date || new Date().toISOString(),
      notes,
    });

    await transactionRepo.save(updated);
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

    if (updated.status === 'SETTLED') {
      showToast('Debt fully settled! 🎉', 'success');
    } else {
      showToast(`Recorded settlement of ${currency.symbol}${amount}`, 'success');
    }
  };

  const settleFullTransaction = async (
    transactionId: string,
    notes?: string,
    date?: string
  ): Promise<void> => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) throw new Error('Transaction not found');

    const updated = TransactionService.settleFull(tx, date || new Date().toISOString(), notes);
    await transactionRepo.save(updated);
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Debt fully settled! 🎉', 'success');
  };

  // Backup & Data management
  const exportData = () => {
    const backup = BackupService.generateBackup(persons, transactions, currency);
    BackupService.downloadBackupFile(backup);
    showToast('Backup downloaded successfully', 'success');
  };

  const importData = async (jsonStr: string): Promise<void> => {
    const backup = BackupService.parseAndValidateBackup(jsonStr);
    await personRepo.clear();
    await transactionRepo.clear();

    await personRepo.saveBatch(backup.persons);
    await transactionRepo.saveBatch(backup.transactions);

    setPersons(backup.persons);
    setTransactions(backup.transactions);
    setCurrency(backup.currency);
    showToast(`Imported ${backup.persons.length} people & ${backup.transactions.length} records!`, 'success');
  };

  const loadDemoData = async (): Promise<void> => {
    const demo = BackupService.getSampleData();
    await personRepo.clear();
    await transactionRepo.clear();

    await personRepo.saveBatch(demo.persons);
    await transactionRepo.saveBatch(demo.transactions);

    setPersons(demo.persons);
    setTransactions(demo.transactions);
    showToast('Loaded demo data successfully!', 'success');
  };

  const resetAllData = async (): Promise<void> => {
    await personRepo.clear();
    await transactionRepo.clear();
    setPersons([]);
    setTransactions([]);
    showToast('All data has been reset', 'info');
  };

  return (
    <IOUMContext.Provider
      value={{
        persons,
        transactions,
        personSummaries,
        overallSummary,
        currency,
        setCurrency,
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isLoading,
        toasts,
        removeToast,
        showToast,
        addPerson,
        updatePerson,
        deletePerson,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        settleTransaction,
        settleFullTransaction,
        exportData,
        importData,
        loadDemoData,
        resetAllData,
      }}
    >
      {children}
    </IOUMContext.Provider>
  );
};

export function useIOUM(): IOUMContextValue {
  const ctx = useContext(IOUMContext);
  if (!ctx) {
    throw new Error('useIOUM must be used within an IOUMProvider');
  }
  return ctx;
}
