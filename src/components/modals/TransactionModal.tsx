import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, UserCheck, UserPlus } from 'lucide-react';
import type { Transaction, TransactionType } from '../../types';
import { useIOUM } from '../../context/IOUMContext';
import { getCurrentDateTimeLocal, toDateTimeLocalString } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
  initialType?: TransactionType;
  initialPersonId?: string;
  onOpenNewPerson?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
  initialType = 'LENT',
  initialPersonId,
}) => {
  const { persons, addPerson, addTransaction, updateTransaction, currency } = useIOUM();

  const [type, setType] = useState<TransactionType>(initialType);
  const [personId, setPersonId] = useState<string>('');
  const [isCreatingNewPerson, setIsCreatingNewPerson] = useState<boolean>(persons.length === 0);
  const [newPersonName, setNewPersonName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getCurrentDateTimeLocal());
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setPersonId(transactionToEdit.personId);
      setIsCreatingNewPerson(false);
      setNewPersonName('');
      setAmount(transactionToEdit.amount.toString());
      setDate(
        transactionToEdit.date
          ? toDateTimeLocalString(transactionToEdit.date)
          : getCurrentDateTimeLocal()
      );
      setDueDate(
        transactionToEdit.dueDate ? toDateTimeLocalString(transactionToEdit.dueDate) : ''
      );
      setDescription(transactionToEdit.description || '');
    } else {
      setType(initialType);
      if (initialPersonId) {
        setPersonId(initialPersonId);
        setIsCreatingNewPerson(false);
      } else if (persons.length > 0) {
        setPersonId(persons[0].id);
        setIsCreatingNewPerson(false);
      } else {
        setPersonId('');
        setIsCreatingNewPerson(true);
      }
      setNewPersonName('');
      setAmount('');
      setDate(getCurrentDateTimeLocal());
      setDueDate('');
      setDescription('');
    }
    setError(null);
  }, [transactionToEdit, initialType, initialPersonId, persons.length, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }

    let targetPersonId = personId;

    try {
      setIsSubmitting(true);

      // If creating person inline
      if (isCreatingNewPerson || !targetPersonId) {
        if (!newPersonName.trim()) {
          setError('Please enter the person’s name');
          setIsSubmitting(false);
          return;
        }
        const createdPerson = await addPerson({
          name: newPersonName.trim(),
        });
        targetPersonId = createdPerson.id;
      }

      if (!targetPersonId) {
        setError('Please select or specify a person');
        setIsSubmitting(false);
        return;
      }

      const finalDesc = description.trim() || undefined;
      const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();
      const isoDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;

      if (transactionToEdit) {
        await updateTransaction({
          ...transactionToEdit,
          type,
          personId: targetPersonId,
          amount: numAmount,
          remainingAmount:
            numAmount - (transactionToEdit.amount - transactionToEdit.remainingAmount),
          date: isoDate,
          dueDate: isoDueDate,
          description: finalDesc || (type === 'LENT' ? 'Loan' : 'Borrowed'),
        });
      } else {
        await addTransaction({
          type,
          personId: targetPersonId,
          amount: numAmount,
          date: isoDate,
          dueDate: isoDueDate,
          description: finalDesc,
        });
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        transactionToEdit
          ? 'Edit Transaction'
          : type === 'LENT'
          ? 'Record Lent Money'
          : 'Record Borrowed Money'
      }
      subtitle={
        type === 'LENT'
          ? 'You lent money to someone and they will pay you back'
          : 'You borrowed money from someone and you need to pay them back'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Type Toggle Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('LENT')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === 'LENT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              I Lent Money (They owe me)
            </button>
            <button
              type="button"
              onClick={() => setType('BORROWED')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                type === 'BORROWED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              I Borrowed (I owe them)
            </button>
          </div>
        </div>

        {/* Person Selector / Inline Creator */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {type === 'LENT' ? 'Who did you lend to?' : 'Who did you borrow from?'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            {persons.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCreatingNewPerson(!isCreatingNewPerson)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                {isCreatingNewPerson ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    Select existing person
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    + New person
                  </>
                )}
              </button>
            )}
          </div>

          {isCreatingNewPerson || persons.length === 0 ? (
            <div className="space-y-1">
              <input
                type="text"
                required
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Enter person name (e.g. Sarah, Alex, Mom)"
                className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Will be automatically added to your contacts.
              </p>
            </div>
          ) : (
            <select
              required
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="" disabled>
                Select a person...
              </option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Amount ({currency.code}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              {currency.symbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Description / Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description / Reason (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner split, concert tickets, rent advance"
            className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white"
          />
        </div>

        {/* Date & Optional Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Due Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="submit"
            variant={type === 'LENT' ? 'emerald' : 'rose'}
            isLoading={isSubmitting}
            icon={<Check className="w-4 h-4" />}
            className="w-full sm:w-auto min-h-[44px] font-bold"
          >
            {transactionToEdit
              ? 'Save Changes'
              : type === 'LENT'
              ? 'Record Loan'
              : 'Record Borrowed'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
