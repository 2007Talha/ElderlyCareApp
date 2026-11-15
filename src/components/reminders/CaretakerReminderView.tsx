'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Medication, EmailDispatchLog } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { Send, AlertTriangle, ShieldAlert, Zap, RefreshCw, CheckCircle } from 'lucide-react';

/** Caretaker Clinical Reminder & Escalation Management Hub. */
export default function CaretakerReminderView() {
  const [lowInventory, setLowInventory] = useState<Medication[]>([]);
  const [recentLogs, setRecentLogs] = useState<EmailDispatchLog[]>([]);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [sendingNudge, setSendingNudge] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const [mRes, lRes] = await Promise.all([fetch('/api/medications'), fetch('/api/email-logs')]);
      const [mData, lData] = await Promise.all([mRes.json(), lRes.json()]);
      if (mData.success && mData.data?.lowInventory) setLowInventory(mData.data.lowInventory);
      if (lData.success && lData.data) setRecentLogs(lData.data);
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleDispatchReminders = useCallback(async () => {
    setDispatching(true);
    try {
      await fetch('/api/reminders/dispatch', { method: 'POST' });
      await fetchStatus();
    } catch { /* fallback */ }
    finally { setDispatching(false); }
  }, [fetchStatus]);

  const handleSendNudge = useCallback(async (msg?: string) => {
    setSendingNudge(true);
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg || nudgeMessage || 'Please confirm your medication intake for clinical monitoring.',
          requestedBy: 'Caretaker',
        }),
      });
      setNudgeSuccess(true);
      setNudgeMessage('');
      setTimeout(() => setNudgeSuccess(false), 3000);
      await fetchStatus();
    } catch { /* fallback */ }
    finally { setSendingNudge(false); }
  }, [nudgeMessage, fetchStatus]);

  const latestLogs = useMemo(() => recentLogs.slice(-3).reverse(), [recentLogs]);

  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" aria-hidden="true" />
            Clinical Reminders & Escalation Hub
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Automated monitoring scans for missed doses, refills, and check-ins.</p>
        </div>
        <button
          onClick={handleDispatchReminders}
          disabled={dispatching}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          {dispatching ? 'Running Scan...' : 'Dispatch Automated Checks'}
        </button>
      </div>

      {lowInventory.length > 0 && (
        <section aria-labelledby="low-inv-heading" className="space-y-3">
          <h3 id="low-inv-heading" className="text-base font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            Active Supply Escalations ({lowInventory.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowInventory.map((med) => (
              <div key={med.id} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-white">{med.medicationName} ({med.dosage})</p>
                  <p className="text-xs text-amber-300/90 mt-0.5">Remaining supply: {med.inventoryCount} doses</p>
                </div>
                <button
                  onClick={() => handleSendNudge(`Refill Reminder: Only ${med.inventoryCount} pills of ${med.medicationName} left.`)}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                >
                  Send Alert
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="nudge-heading" className="p-4 rounded-xl bg-surface border border-border-color space-y-3 shadow-sm">
        <h3 id="nudge-heading" className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Send className="w-4 h-4 text-teal-400" aria-hidden="true" />
          Send Immediate Clinical Nudge
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={nudgeMessage}
            onChange={(e) => setNudgeMessage(e.target.value)}
            placeholder="Type clinical check-in message..."
            className="flex-1 bg-card-subtle border border-border-color rounded-lg px-3 py-2 text-xs text-text-primary focus:border-amber-500"
          />
          <button
            onClick={() => handleSendNudge()}
            disabled={sendingNudge || !nudgeMessage.trim()}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
        {nudgeSuccess && (
          <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Nudge delivered to elderly interface!
          </p>
        )}
      </section>

      <section aria-labelledby="dispatches-heading" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 id="dispatches-heading" className="text-sm font-bold text-text-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-text-secondary" aria-hidden="true" />
            Recent Proactive Escalations & Reminders
          </h3>
          <span className="text-xs text-text-secondary">{recentLogs.length} logged</span>
        </div>
        <div className="space-y-2">
          {latestLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-surface border border-border-color flex items-center justify-between text-xs shadow-sm">
              <div>
                <p className="font-semibold text-text-primary">{log.subject}</p>
                <p className="text-text-secondary mt-0.5">To: {log.recipient} • Reason: {log.triggerReason}</p>
              </div>
              <StatusBadge status={log.deliveryStatus} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
