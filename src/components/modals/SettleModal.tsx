import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useIOUM } from '../../context/IOUMContext';
import { formatCurrency, getCurrentDateTimeLocal } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

export const SettleModal: React.FC<SettleModalProps> = ({
  isOpen,
  onClose,
  transactionId,
}) => {
  const { transactions, persons, settleTransaction, currency } = useIOUM();

  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleDate, setSettleDate] = useState<string>(getCurrentDateTimeLocal());
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const transaction = transactions.find((t) => t.id === transactionId);
  const person = persons.find((p) => p.id === transaction?.personId);

  useEffect(() => {
    if (transaction) {
      setSettleAmount(transaction.remainingAmount.toString());
      setSettleDate(getCurrentDateTimeLocal());
      setNotes('');
      setError(null);
    }
  }, [transaction, isOpen]);

  if (!transaction) return null;

  const handleSettleFull = () => {
    setSettleAmount(transaction.remainingAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(settleAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }
    if (amount > transaction.remainingAmount) {
      setError(`Cannot settle more than the remaining balance of ${formatCurrency(transaction.remainingAmount, currency)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const isoDate = settleDate ? new Date(settleDate).toISOString() : new Date().toISOString();
      await settleTransaction(transaction.id, amount, notes.trim() || undefined, isoDate);

      // If fully settled, trigger festive confetti!
      if (amount >= transaction.remainingAmount) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas not supported
        }
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Settlement failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFullSettle = parseFloat(settleAmount) >= transaction.remainingAmount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Transaction"
      subtitle={`Record payment for "${transaction.description || (transaction.type === 'LENT' ? 'Loan' : 'Borrowed')}" with ${person?.name || 'person'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Balance Info Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Remaining Balance
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(transaction.remainingAmount, currency)}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSettleFull}
            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
          >
            Settle All
          </Button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Settlement Amount ({currency.code}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              {currency.symbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={transaction.remainingAmount}
              required
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              className="w-full pl-8 pr-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm font-semibold text-slate-900 dark:text-white"
            />
          </div>
          {isFullSettle && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> This will fully clear and settle this debt!
            </p>
          )}
        </div>

        {/* Settlement Date & Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Settlement Date & Time <span className="text-rose-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={settleDate}
            onChange={(e) => setSettleDate(e.target.value)}
            className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white cursor-pointer"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Notes / Reference (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Cash, Venmo transfer, bank transfer"
            className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="emerald"
            isLoading={isSubmitting}
            icon={<CheckCircle2 className="w-4 h-4" />}
            className="w-full sm:w-auto min-h-[44px] font-bold"
          >
            Confirm Settlement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
