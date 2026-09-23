import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Scale,
  UserPlus,
  Users,
} from 'lucide-react';
import { useIOUM } from '../../context/IOUMContext';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';

interface SummaryCardsProps {
  onOpenNewTransaction: (type?: 'LENT' | 'BORROWED') => void;
  onOpenNewPerson: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  onOpenNewTransaction,
  onOpenNewPerson,
}) => {
  const { overallSummary, currency } = useIOUM();

  const isPositiveNet = overallSummary.netBalance > 0;
  const isNegativeNet = overallSummary.netBalance < 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep track of who owes you and who you owe with zero stress.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <Button
            variant="emerald"
            size="md"
            onClick={() => onOpenNewTransaction('LENT')}
            icon={<ArrowUpRight className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            Lend Money
          </Button>

          <Button
            variant="rose"
            size="md"
            onClick={() => onOpenNewTransaction('BORROWED')}
            icon={<ArrowDownLeft className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            Borrow Money
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onOpenNewPerson}
            icon={<UserPlus className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
          >
            Add Person
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Card 1: Net Balance */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Balance
            </span>
            <div
              className={`p-2.5 rounded-xl ${
                isPositiveNet
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : isNegativeNet
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div
              className={`text-3xl font-extrabold tracking-tight ${
                isPositiveNet
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isNegativeNet
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {isPositiveNet ? '+' : isNegativeNet ? '-' : ''}
              {formatCurrency(overallSummary.netBalance, currency)}
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              {isPositiveNet
                ? 'Overall, you are in the positive (people owe you more)'
                : isNegativeNet
                ? 'Overall, you owe more money than you are owed'
                : 'All accounts are completely balanced'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {overallSummary.peopleCount} {overallSummary.peopleCount === 1 ? 'person' : 'people'}
            </span>
            <span>
              {overallSummary.activeCount} active {overallSummary.activeCount === 1 ? 'debt' : 'debts'}
            </span>
          </div>
        </div>

        {/* Card 2: You Are Owed (Lent) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-950/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              You Are Owed (Lent)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(overallSummary.totalYouAreOwed, currency)}
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Money friends and contacts will pay back to you
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pending collection</span>
            <button
              type="button"
              onClick={() => onOpenNewTransaction('LENT')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Loan
            </button>
          </div>
        </div>

        {/* Card 3: You Owe (Borrowed) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-6 border border-rose-100 dark:border-rose-950/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              You Owe (Borrowed)
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(overallSummary.totalYouOwe, currency)}
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Money you have borrowed and need to repay
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pending repayment</span>
            <button
              type="button"
              onClick={() => onOpenNewTransaction('BORROWED')}
              className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Borrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
