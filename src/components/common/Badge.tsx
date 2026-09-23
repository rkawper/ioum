import React from 'react';
import type { TransactionStatus, TransactionType } from '../../types';

interface BadgeProps {
  type?: TransactionType;
  status?: TransactionStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, status, label, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  if (type) {
    if (type === 'LENT') {
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-800/50 ${sizeClass}`}
        >
          Lent (Owed)
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-800/50 ${sizeClass}`}
      >
        Borrowed (You Owe)
      </span>
    );
  }

  if (status) {
    switch (status) {
      case 'PENDING':
        return (
          <span
            className={`inline-flex items-center font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ${sizeClass}`}
          >
            Pending
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span
            className={`inline-flex items-center font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 ${sizeClass}`}
          >
            Partially Paid
          </span>
        );
      case 'SETTLED':
        return (
          <span
            className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ${sizeClass}`}
          >
            Settled ✓
          </span>
        );
    }
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ${sizeClass}`}
    >
      {label}
    </span>
  );
};
