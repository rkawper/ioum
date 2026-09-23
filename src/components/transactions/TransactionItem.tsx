import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import type { Person, Transaction } from '../../types';
import { useIOUM } from '../../context/IOUMContext';
import { formatCurrency, formatDateTime, getDueDateStatus } from '../../utils/formatters';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface TransactionItemProps {
  transaction: Transaction;
  person?: Person;
  onSettle: (transactionId: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  onSelectPerson: (personId: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  person,
  onSettle,
  onEdit,
  onDelete,
  onSelectPerson,
}) => {
  const { currency } = useIOUM();
  const [showMenu, setShowMenu] = useState(false);

  const isLent = transaction.type === 'LENT';
  const isSettled = transaction.status === 'SETTLED' || transaction.remainingAmount <= 0;
  const dueDateInfo = getDueDateStatus(transaction.dueDate);

  return (
    <div
      className={`relative group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-150 gap-4 ${
        isSettled
          ? 'border-slate-200 dark:border-slate-800 opacity-75'
          : isLent
          ? 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700/60 shadow-xs'
      }`}
    >
      {/* Left: Direction Icon + Person + Details */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {/* Direction Icon Badge */}
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 sm:mt-0 ${
            isLent
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
          }`}
          title={isLent ? 'Money Lent (Owed to you)' : 'Money Borrowed (You owe)'}
        >
          {isLent ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
        </div>

        {/* Person Avatar */}
        {person && (
          <div
            onClick={() => onSelectPerson(person.id)}
            className="cursor-pointer hover:opacity-80 transition-opacity hidden xs:block"
            title={`View ${person.name}`}
          >
            <Avatar name={person.name} color={person.avatarColor} size="md" />
          </div>
        )}

        {/* Text info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {person && (
              <button
                type="button"
                onClick={() => onSelectPerson(person.id)}
                className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {person.name}
              </button>
            )}
            <Badge type={transaction.type} />
            <Badge status={transaction.status} />
          </div>

          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1 truncate">
            {transaction.description || (isLent ? 'Loan' : 'Borrowed')}
          </h4>

          {/* Metadata chips (Date, Due date) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateTime(transaction.date)}
            </span>

            {dueDateInfo && !isSettled && (
              <>
                <span>•</span>
                <span
                  className={`flex items-center gap-1 font-medium ${
                    dueDateInfo.isOverdue
                      ? 'text-rose-600 dark:text-rose-400'
                      : dueDateInfo.isDueSoon
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {dueDateInfo.isOverdue ? (
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {dueDateInfo.label}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amounts & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
        <div className="text-left sm:text-right">
          <div
            className={`text-base sm:text-lg font-bold tracking-tight ${
              isSettled
                ? 'text-slate-400 dark:text-slate-500 line-through'
                : isLent
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isLent ? '+' : '-'}
            {formatCurrency(transaction.remainingAmount, currency)}
          </div>
          {transaction.remainingAmount !== transaction.amount && (
            <div className="text-[11px] text-slate-400">
              of {formatCurrency(transaction.amount, currency)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isSettled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSettle(transaction.id)}
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              className="text-xs"
            >
              Settle
            </Button>
          )}

          {/* Action Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-40">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(transaction);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(transaction.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
