import React from 'react';
import { ArrowDownUp, Filter, Search } from 'lucide-react';
import type { FilterState, Person, SortOption } from '../../types';

interface TransactionFiltersProps {
  filterState: FilterState;
  onFilterChange: (next: Partial<FilterState>) => void;
  persons: Person[];
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filterState,
  onFilterChange,
  persons,
}) => {
  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by description or person..."
            className="w-full pl-9 pr-3.5 py-2 text-base sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Dropdowns row: 2-columns on mobile, inline on desktop */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5">
          {/* Person Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={filterState.personId}
              onChange={(e) => onFilterChange({ personId: e.target.value })}
              className="w-full px-2.5 sm:px-3 py-2 text-base sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer truncate"
            >
              <option value="ALL">All People</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-44 flex items-center gap-1.5">
            <ArrowDownUp className="w-4 h-4 text-slate-400 flex-shrink-0 hidden xs:block sm:block" />
            <select
              value={filterState.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
              className="w-full px-2.5 sm:px-3 py-2 text-base sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer truncate"
            >
              <option value="DATE_DESC">Newest First</option>
              <option value="DATE_ASC">Oldest First</option>
              <option value="AMOUNT_DESC">Highest Amount</option>
              <option value="AMOUNT_ASC">Lowest Amount</option>
              <option value="DUE_DATE">Due Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom row: Type & Status Filter Pills (Horizontal scrollable on mobile) */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800/80 -mx-1 px-1">
        {/* Type pills: All / Lent / Borrowed */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-400 mr-0.5 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Type:
          </span>
          {(['ALL', 'LENT', 'BORROWED'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onFilterChange({ type: t })}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[32px] flex items-center ${
                filterState.type === t
                  ? t === 'LENT'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : t === 'BORROWED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t === 'LENT' ? 'Lent' : 'Borrowed'}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

        {/* Status pills: All / Active / Settled */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-400 mr-0.5">Status:</span>
          {(['ALL', 'ACTIVE', 'SETTLED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onFilterChange({ status: s })}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[32px] flex items-center ${
                filterState.status === s
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s === 'ALL' ? 'All' : s === 'ACTIVE' ? 'Active' : 'Settled'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
