'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Mail, X } from 'lucide-react';

export interface ToastData {
  readonly id: string;
  readonly message: string;
  readonly type: 'success' | 'warning' | 'email' | 'info';
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

interface ToastNotificationProps {
  readonly toast: ToastData | null;
  readonly onDismiss: () => void;
}

/** Floating accessible toast notification with interactive action triggers. */
export default function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="bg-gray-900 border border-teal-500/40 rounded-xl p-3.5 shadow-2xl flex items-start gap-3 text-white">
        <div className="shrink-0 mt-0.5">
          {toast.type === 'email' && <Mail className="w-5 h-5 text-sky-400" />}
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {toast.type === 'info' && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-200 leading-snug">{toast.message}</p>
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => { toast.onAction?.(); onDismiss(); }}
              className="mt-2 text-xs font-bold text-teal-300 hover:text-white bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 px-2.5 py-1 rounded-md transition-colors"
            >
              {toast.actionLabel} →
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
