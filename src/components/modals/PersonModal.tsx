import React, { useEffect, useState } from 'react';
import type { Person } from '../../types';
import { useIOUM } from '../../context/IOUMContext';
import { AVATAR_COLORS } from '../../services/person/PersonService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
}) => {
  const { addPerson, updatePerson } = useIOUM();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setPhone(personToEdit.phone || '');
      setEmail(personToEdit.email || '');
      setNotes(personToEdit.notes || '');
      setAvatarColor(personToEdit.avatarColor || AVATAR_COLORS[0]);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setNotes('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
    setError(null);
  }, [personToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a person name');
      return;
    }

    try {
      setIsSubmitting(true);
      if (personToEdit) {
        await updatePerson({
          ...personToEdit,
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
          avatarColor,
        });
      } else {
        await addPerson({
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
          avatarColor,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={personToEdit ? 'Edit Person' : 'Add New Person'}
      subtitle={
        personToEdit
          ? 'Update contact details or preferences'
          : 'Add a friend, colleague, or family member to track debts'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Name input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white"
            autoFocus
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Avatar Color Theme
          </label>
          <div className="flex items-center gap-2.5 sm:gap-2 flex-wrap">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                className={`w-9 h-9 sm:w-7 sm:h-7 rounded-full cursor-pointer transition-transform ${
                  avatarColor === c
                    ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                    : 'hover:scale-105 active:scale-95'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Phone & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0123"
              className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Notes / Relationship (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Roommate, Tennis buddy, Work team"
            className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm text-slate-900 dark:text-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto min-h-[44px]">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full sm:w-auto min-h-[44px] font-bold">
            {personToEdit ? 'Save Changes' : 'Create Person'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
