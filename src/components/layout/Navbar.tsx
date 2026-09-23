import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Monitor,
  Moon,
  Settings,
  Sun,
  WifiOff,
} from 'lucide-react';
import { useIOUM } from '../../context/IOUMContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { DEFAULT_CURRENCIES } from '../../services/backup/BackupService';
import { formatCurrency } from '../../utils/formatters';

interface NavbarProps {
  onOpenSettingsModal: () => void;
  onOpenNewTransaction: (type?: 'LENT' | 'BORROWED') => void;
  onOpenNewPerson: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettingsModal,
}) => {
  const { currency, setCurrency, theme, resolvedTheme, toggleTheme, overallSummary } = useIOUM();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600">
              <img src="/icon.svg" alt="IOUM" className="w-10 h-10 object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  IOUM
                </span>
                {isOnline ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hidden sm:inline-block">
                    Offline-First
                  </span>
                ) : (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 flex items-center gap-1 shadow-xs"
                    title="Working completely offline. All data is saved on your device."
                  >
                    <WifiOff className="w-3 h-3 text-amber-500" />
                    <span>Offline Mode</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide hidden md:block">
                I Owe You &amp; Me
              </p>
            </div>
          </div>

          {/* Center Mini-Stats (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Owed to you: {formatCurrency(overallSummary.totalYouAreOwed, currency)}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>You owe: {formatCurrency(overallSummary.totalYouOwe, currency)}</span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Currency Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 min-h-[36px]"
                title="Change Currency"
              >
                <span>{currency.code}</span>
                <span className="text-slate-400 hidden xs:inline">({currency.symbol})</span>
              </button>

              {showCurrencyDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCurrencyDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Currency
                    </div>
                    {DEFAULT_CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCurrency(c);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer ${
                          currency.code === c.code
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>
                          {c.code} - {c.name}
                        </span>
                        <span className="font-mono text-slate-500">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Toggle theme mode"
              title={
                theme === 'system'
                  ? `Theme: System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'}) - Click for Light Mode`
                  : theme === 'light'
                  ? 'Theme: Light - Click for Dark Mode'
                  : 'Theme: Dark - Click for System Default'
              }
            >
              {theme === 'system' ? (
                <Monitor className="w-4 h-4 text-indigo-500" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Settings & Backup Modal Trigger */}
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Settings and Backup"
              title="Settings &amp; Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
