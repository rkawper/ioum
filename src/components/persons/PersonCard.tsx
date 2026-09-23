import React from 'react';
import { ChevronRight, Phone, Mail } from 'lucide-react';
import type { PersonBalanceSummary } from '../../types';
import { useIOUM } from '../../context/IOUMContext';
import { formatCurrency } from '../../utils/formatters';
import { Avatar } from '../common/Avatar';

interface PersonCardProps {
  summary: PersonBalanceSummary;
  onSelect: (personId: string) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ summary, onSelect }) => {
  const { currency } = useIOUM();
  const { person, netBalance, activeCount } = summary;

  const isOwed = netBalance > 0;
  const isOwing = netBalance < 0;
  const isSettled = netBalance === 0;

  return (
    <div
      onClick={() => onSelect(person.id)}
      className="group relative flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(person.id);
        }
      }}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <Avatar name={person.name} color={person.avatarColor} size="md" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {person.name}
            </h4>
            {activeCount > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {activeCount} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {person.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {person.phone}
              </span>
            )}
            {person.phone && person.email && <span>•</span>}
            {person.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3" />
                {person.email}
              </span>
            )}
            {!person.phone && !person.email && person.notes && (
              <span className="truncate">{person.notes}</span>
            )}
            {!person.phone && !person.email && !person.notes && (
              <span className="italic text-slate-400">No contact info</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <div className="text-right">
          <div
            className={`text-sm font-bold tracking-tight ${
              isOwed
                ? 'text-emerald-600 dark:text-emerald-400'
                : isOwing
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {isOwed ? `+${formatCurrency(netBalance, currency)}` : ''}
            {isOwing ? `-${formatCurrency(Math.abs(netBalance), currency)}` : ''}
            {isSettled ? `${currency.symbol}0.00` : ''}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isOwed ? 'Owes you' : isOwing ? 'You owe' : 'Settled'}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
};
