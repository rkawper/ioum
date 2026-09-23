import React from 'react';
import { Database, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { useIOUM } from '../../context/IOUMContext';

interface FooterProps {
  onOpenSettingsModal: () => void;
  onOpenDownloadModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSettingsModal, onOpenDownloadModal }) => {
  const { persons, transactions, loadDemoData } = useIOUM();

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          {/* Privacy badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Client-Side &amp; Private
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">No accounts, no trackers</span>
          </div>

          {/* Quick links & Demo generator */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {persons.length === 0 && transactions.length === 0 && (
              <button
                type="button"
                onClick={loadDemoData}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Data
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              Backup &amp; Restore
            </button>
            <button
              type="button"
              onClick={onOpenDownloadModal}
              className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Download App
            </button>
          </div>

          {/* Copyright / signature */}
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <span>IOUM v1.0.0</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for debt clarity
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
