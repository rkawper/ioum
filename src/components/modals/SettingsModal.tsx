import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Coins,
  Download,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { useIOUM } from '../../context/IOUMContext';
import { DEFAULT_CURRENCIES } from '../../services/backup/BackupService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currency,
    setCurrency,
    theme,
    toggleTheme,
    exportData,
    importData,
    loadDemoData,
    resetAllData,
    showToast,
  } = useIOUM();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      await importData(text);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to import backup file', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = async () => {
    await resetAllData();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings &amp; Backup"
      subtitle="Manage preferences, data persistence, and JSON backups"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Currency & Appearance Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Preferences
          </h4>

          {/* Currency */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Currency</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Display symbol across app</div>
              </div>
            </div>

            <select
              value={currency.code}
              onChange={(e) => {
                const found = DEFAULT_CURRENCIES.find((c) => c.code === e.target.value);
                if (found) setCurrency(found);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
            >
              {DEFAULT_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Appearance / Theme */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Theme Mode</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Currently {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>

        {/* Backup & Portability */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Data Portability &amp; Backups
          </h4>

          {/* Export JSON */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 gap-2.5">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Export Backup (JSON)</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Download a complete copy of all people and transactions
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              icon={<Download className="w-3.5 h-3.5" />}
              className="w-full xs:w-auto min-h-[36px]"
            >
              Export
            </Button>
          </div>

          {/* Import JSON */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 gap-2.5">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Restore Backup (JSON)</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Restore your data from a previously exported backup file
              </div>
            </div>

            <div className="w-full xs:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isImporting}
                icon={<Upload className="w-3.5 h-3.5" />}
                className="w-full xs:w-auto min-h-[36px]"
              >
                Import
              </Button>
            </div>
          </div>

          {/* Load Sample Data */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 gap-2.5">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Load Sample Data</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Pre-populate sample friends and loans to explore the app
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await loadDemoData();
                onClose();
              }}
              icon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
              className="w-full xs:w-auto min-h-[36px]"
            >
              Load Demo
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-500">Danger Zone</h4>

          {!showResetConfirm ? (
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 gap-2.5">
              <div>
                <div className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                  Reset All Data
                </div>
                <div className="text-xs text-rose-600/80 dark:text-rose-400/80">
                  Permanently erase all people, debts, and history
                </div>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
                className="w-full xs:w-auto min-h-[36px]"
              >
                Reset
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Are you sure you want to reset all data?
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                This will wipe out all local records. If you haven't exported a backup, this cannot be recovered.
              </p>
              <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)} className="w-full xs:w-auto min-h-[38px]">
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />} className="w-full xs:w-auto min-h-[38px]">
                  Confirm Wipeout
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto min-h-[44px]">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
