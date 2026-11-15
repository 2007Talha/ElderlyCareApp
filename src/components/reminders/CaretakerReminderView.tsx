'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Medication, EmailDispatchLog, ApiResponse } from '@/types';
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
      const mData = await mRes.json();
      const lData = await lRes.json();
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

  return (
    <div className="space-y-6">
      {/* Header and Automated Dispatch Trigger */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" aria-hidden="true" />
            Clinical Reminders & Escalation Hub
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Automated monitoring scans for missed doses, refills, and urgent check-ins.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDispatchReminders}
            disabled={dispatching}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            {dispatching ? 'Running Scan...' : 'Dispatch Automated Checks'}
          </button>
        </div>
      </div>

      {/* Critical Refill Alerts */}
      {lowInventory.length > 0 && (
        <section aria-labelledby="low-inv-heading" className="space-y-3">
          <h3 id="low-inv-heading" className="text-base font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            Active Supply Escalations ({lowInventory.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowInventory.map((med) => (
              <div key={med.id} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-white">{med.medicationName} ({med.dosage})</p>
                  <p className="text-xs text-amber-300/90 mt-0.5">Remaining supply: {med.inventoryCount} doses (Refill required)</p>
                </div>
                <button
                  onClick={() => handleSendNudge(`Refill Reminder: Only ${med.inventoryCount} pills of ${med.medicationName} left. Pharmacy order pending.`)}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  Send Refill Alert
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clinical Nudge Tool */}
      <section aria-labelledby="nudge-heading" className="p-5 rounded-2xl bg-surface border border-gray-800 space-y-4">
        <h3 id="nudge-heading" className="text-base font-bold flex items-center gap-2">
          <Send className="w-5 h-5 text-teal-400" aria-hidden="true" />
          Send Immediate Clinical Nudge to Elderly Dashboard
        </h3>
        <p className="text-xs text-gray-400">
          This triggers a high-priority prompt banner on the elderly individual&apos;s interface and logs an email alert.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSendNudge('Clinical Check-in: Please remember to take your scheduled afternoon medication.')}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            + Afternoon Dose Nudge
          </button>
          <button
            onClick={() => handleSendNudge('Pre-appointment Reminder: Remember to record blood pressure readings before tomorrow’s visit.')}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            + Blood Pressure Log Nudge
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={nudgeMessage}
            onChange={(e) => setNudgeMessage(e.target.value)}
            placeholder="Or type a custom clinical message..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSendNudge()}
            disabled={sendingNudge || !nudgeMessage.trim()}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>

        {nudgeSuccess && (
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Priority clinical nudge delivered to elderly interface!
          </p>
        )}
      </section>

      {/* Recent Dispatches Preview */}
      <section aria-labelledby="dispatches-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 id="dispatches-heading" className="text-base font-bold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gray-400" aria-hidden="true" />
            Recent Proactive Escalations & Reminders
          </h3>
          <span className="text-xs text-gray-400">{recentLogs.length} total logged</span>
        </div>
        <div className="space-y-2">
          {recentLogs.slice(-3).reverse().map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl bg-surface border border-gray-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">{log.subject}</p>
                <p className="text-xs text-gray-400 mt-0.5">To: {log.recipient} • Reason: {log.triggerReason}</p>
              </div>
              <StatusBadge status={log.deliveryStatus} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
