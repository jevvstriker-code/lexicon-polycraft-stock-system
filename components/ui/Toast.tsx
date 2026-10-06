'use client';

import React from 'react';

export interface ToastState {
  show: boolean;
  message: string;
  isError: boolean;
}

interface ToastProps {
  toast: ToastState;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast.show) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
      <i
        className={`fa-solid ${
          toast.isError
            ? 'fa-circle-exclamation text-rose-400'
            : 'fa-check text-emerald-400'
        }`}
      />
      <span>{toast.message}</span>
    </div>
  );
};
