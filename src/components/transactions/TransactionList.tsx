import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Receipt, Sparkles } from 'lucide-react';
import type { FilterState, Transaction } from '../../types';
import { useIOUM } from '../../context/IOUMContext';
import { Button } from '../common/Button';
import { TransactionFilters } from './TransactionFilters';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  onOpenNewTransaction: (type?: 'LENT' | 'BORROWED') => void;
  onEditTransaction: (transaction: Transaction) => void;
  onSettleTransaction: (transactionId: string) => void;
  onSelectPerson: (personId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
  onSettleTransaction,
  onSelectPerson,
}) => {
  const { transactions, persons, deleteTransaction, loadDemoData } = useIOUM();

  const [filters, setFilters] = useState<FilterState>({
    type: 'ALL',
    status: 'ALL',
    personId: 'ALL',
    searchQuery: '',
    sortBy: 'DATE_DESC',
  });

  const handleFilterChange = (next: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  // Map person lookup by ID for performance
  const personMap = useMemo(() => {
    const map = new Map<string, (typeof persons)[0]>();
    for (const p of persons) {
      map.set(p.id, p);
    }
    return map;
  }, [persons]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (filters.type !== 'ALL' && tx.type !== filters.type) {
          return false;
        }

        // Status filter
        if (filters.status === 'ACTIVE' && (tx.status === 'SETTLED' || tx.remainingAmount <= 0)) {
          return false;
        }
        if (filters.status === 'SETTLED' && tx.status !== 'SETTLED' && tx.remainingAmount > 0) {
          return false;
        }

        // Person filter
        if (filters.personId !== 'ALL' && tx.personId !== filters.personId) {
          return false;
        }

        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const person = personMap.get(tx.personId);
          const personName = person ? person.name.toLowerCase() : '';
          const desc = (tx.description || '').toLowerCase();
          const cat = tx.category.toLowerCase();

          if (!desc.includes(q) && !personName.includes(q) && !cat.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'DATE_DESC':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'DATE_ASC':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'AMOUNT_DESC':
            return b.remainingAmount - a.remainingAmount;
          case 'AMOUNT_ASC':
            return a.remainingAmount - b.remainingAmount;
          case 'DUE_DATE': {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          default:
            return 0;
        }
      });
  }, [transactions, filters, personMap]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Transactions History
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filteredTransactions.length}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <TransactionFilters
        filterState={filters}
        onFilterChange={handleFilterChange}
        persons={persons}
      />

      {/* Transactions Feed */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {transactions.length === 0
              ? 'No transactions recorded yet'
              : 'No transactions match your filters'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {transactions.length === 0
              ? 'Record a loan or a borrowed expense to start keeping track of who owes what.'
              : 'Try clearing some filters or searching with different keywords.'}
          </p>

          {transactions.length === 0 ? (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                variant="emerald"
                size="sm"
                onClick={() => onOpenNewTransaction('LENT')}
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Record Loan (Lent)
              </Button>
              <Button
                variant="rose"
                size="sm"
                onClick={() => onOpenNewTransaction('BORROWED')}
                icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
              >
                Record Borrowed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDemoData}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Load Sample Data
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  type: 'ALL',
                  status: 'ALL',
                  personId: 'ALL',
                  searchQuery: '',
                  sortBy: 'DATE_DESC',
                })
              }
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              person={personMap.get(tx.personId)}
              onSettle={onSettleTransaction}
              onEdit={onEditTransaction}
              onDelete={deleteTransaction}
              onSelectPerson={onSelectPerson}
            />
          ))}
        </div>
      )}
    </div>
  );
};
