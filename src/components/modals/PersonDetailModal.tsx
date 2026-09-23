import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Edit2,
  Mail,
  Phone,
  Trash2,
} from 'lucide-react';
import { useIOUM } from '../../context/IOUMContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface PersonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string | null;
  onEditPerson: (personId: string) => void;
  onNewTransactionWithPerson: (personId: string, type: 'LENT' | 'BORROWED') => void;
  onSettleTransaction: (transactionId: string) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  isOpen,
  onClose,
  personId,
  onEditPerson,
  onNewTransactionWithPerson,
  onSettleTransaction,
}) => {
  const { persons, transactions, deletePerson, currency } = useIOUM();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!personId) return null;

  const person = persons.find((p) => p.id === personId);
  if (!person) return null;

  const personTxs = transactions
    .filter((tx) => tx.personId === personId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate net balance
  let totalLent = 0;
  let totalBorrowed = 0;
  for (const tx of personTxs) {
    if (tx.status !== 'SETTLED' && tx.remainingAmount > 0) {
      if (tx.type === 'LENT') totalLent += tx.remainingAmount;
      if (tx.type === 'BORROWED') totalBorrowed += tx.remainingAmount;
    }
  }
  const netBalance = Math.round((totalLent - totalBorrowed + Number.EPSILON) * 100) / 100;
  const isOwed = netBalance > 0;
  const isOwing = netBalance < 0;

  const handleDelete = async () => {
    await deletePerson(person.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Person Details" maxWidth="lg">
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <Avatar name={person.name} color={person.avatarColor} size="lg" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{person.name}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                {person.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {person.phone}
                  </span>
                )}
                {person.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {person.email}
                  </span>
                )}
                {person.notes && <span>{person.notes}</span>}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditPerson(person.id)}
              icon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Box */}
        {showDeleteConfirm && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
            <div className="text-sm font-semibold text-rose-800 dark:text-rose-300">
              Are you sure you want to delete {person.name}?
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-400">
              This will also permanently delete all {personTxs.length} associated transaction records.
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Yes, Delete Everything
              </Button>
            </div>
          </div>
        )}

        {/* Balance Status Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Net Balance
            </span>
            <div
              className={`text-2xl font-extrabold mt-0.5 ${
                isOwed
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isOwing
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {isOwed ? `+${formatCurrency(netBalance, currency)} (Owes you)` : ''}
              {isOwing ? `-${formatCurrency(Math.abs(netBalance), currency)} (You owe)` : ''}
              {netBalance === 0 ? 'Settled Up (0.00)' : ''}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="emerald"
              size="sm"
              onClick={() => onNewTransactionWithPerson(person.id, 'LENT')}
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              Lend
            </Button>
            <Button
              variant="rose"
              size="sm"
              onClick={() => onNewTransactionWithPerson(person.id, 'BORROWED')}
              icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
            >
              Borrow
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Transaction History ({personTxs.length})
          </h4>

          {personTxs.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
              No transactions recorded with {person.name} yet.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {personTxs.map((tx) => {
                const isTxLent = tx.type === 'LENT';
                const isSettled = tx.status === 'SETTLED';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-left"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {tx.description || tx.category || (isTxLent ? 'Loan' : 'Borrowed')}
                        </span>
                        <Badge status={tx.status} />
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{formatDateTime(tx.date)}</span>
                        {tx.category && (
                          <>
                            <span className="mx-1.5">•</span>
                            <span>{tx.category}</span>
                          </>
                        )}
                      </div>
                      {tx.settlements && tx.settlements.length > 0 && (
                        <div className="mt-1.5 space-y-0.5 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                          {tx.settlements.map((s) => (
                            <div key={s.id} className="text-[11px] text-slate-500 dark:text-slate-400">
                              Paid {formatCurrency(s.amount, currency)} on {formatDateTime(s.date)}
                              {s.notes ? ` (${s.notes})` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-sm font-bold ${
                            isTxLent
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isTxLent ? '+' : '-'}
                          {formatCurrency(tx.remainingAmount, currency)}
                        </div>
                        {tx.remainingAmount !== tx.amount && (
                          <div className="text-[10px] text-slate-400 line-through">
                            Original: {formatCurrency(tx.amount, currency)}
                          </div>
                        )}
                      </div>

                      {!isSettled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSettleTransaction(tx.id)}
                          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          className="text-xs py-1 px-2.5"
                        >
                          Settle
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
