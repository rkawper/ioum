import React from 'react';
import { ArrowDownLeft, ArrowUpRight, UserPlus } from 'lucide-react';

interface MobileBottomBarProps {
  onOpenNewTransaction: (type?: 'LENT' | 'BORROWED') => void;
  onOpenNewPerson: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenNewTransaction,
  onOpenNewPerson,
}) => {
  return (
    <nav
      aria-label="Mobile quick actions"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Lend Button */}
        <button
          type="button"
          onClick={() => onOpenNewTransaction('LENT')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
          <span>Lend</span>
        </button>

        {/* Add Person Button */}
        <button
          type="button"
          onClick={onOpenNewPerson}
          className="flex items-center justify-center gap-1 py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer min-h-[44px]"
          title="Add Person"
        >
          <UserPlus className="w-4 h-4 text-indigo-500" />
          <span className="hidden xs:inline">Person</span>
        </button>

        {/* Borrow Button */}
        <button
          type="button"
          onClick={() => onOpenNewTransaction('BORROWED')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 active:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/30 transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <ArrowDownLeft className="w-4 h-4 flex-shrink-0" />
          <span>Borrow</span>
        </button>
      </div>
    </nav>
  );
};
