import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useIOUM } from '../../context/IOUMContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useIOUM();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              isSuccess
                ? 'bg-emerald-900/90 text-white border-emerald-700/60'
                : isError
                ? 'bg-rose-900/90 text-white border-rose-700/60'
                : 'bg-slate-900/90 text-white border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
