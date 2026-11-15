'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmailDispatchLog, ApiResponse } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { MailCheck, RefreshCw, Send } from 'lucide-react';

/** Proactive Email Dispatch & Telemetry Log panel. */
export default function EmailLog() {
  const [logs, setLogs] = useState<EmailDispatchLog[]>([]);
  const [dispatching, setDispatching] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/email-logs');
      const data: ApiResponse<EmailDispatchLog[]> = await res.json();
      if (data.success && data.data) setLogs(data.data);
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const triggerDispatch = useCallback(async () => {
    setDispatching(true);
    try {
      await fetch('/api/reminders/dispatch', { method: 'POST' });
      await fetchLogs();
    } catch { /* fallback */ }
    finally { setDispatching(false); }
  }, [fetchLogs]);

  return (
    <section aria-labelledby="email-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="email-heading" className="text-xl font-bold flex items-center gap-2">
          <MailCheck className="w-6 h-6 text-teal-400" aria-hidden="true" />
          Proactive Email Dispatch & Telemetry Log
        </h2>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 bg-stone-200 hover:bg-stone-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-stone-800 dark:text-white border border-stone-300 dark:border-gray-600 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            aria-label="Refresh email logs"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            onClick={triggerDispatch}
            disabled={dispatching}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            {dispatching ? 'Dispatching...' : 'Dispatch Now'}
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No email dispatches yet. Click &ldquo;Dispatch Now&rdquo; to trigger reminder checks.
        </p>
      ) : (
        <div className="space-y-3" aria-live="polite">
          {logs.slice().reverse().map((log) => (
            <article key={log.id} className="bg-surface border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{log.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    To: {log.recipient} | Trigger: {log.triggerReason}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{log.body}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={log.deliveryStatus} />
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
