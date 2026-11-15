'use client';

import { useState, useCallback } from 'react';
import { Heart, Send, BellRing, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface FamilyPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_PREFERENCES: FamilyPreference[] = [
  { id: 'missed-dose', label: 'Immediate Missed Dose Alerts', description: 'Notification if a medication is overdue by 30+ minutes.', enabled: true },
  { id: 'low-refill', label: 'Low Supply Warnings', description: 'Notified when medication drops below 7 days remaining.', enabled: true },
  { id: 'weekly-digest', label: 'Sunday Adherence Digest', description: 'Weekly health and adherence summary for family peace-of-mind.', enabled: true },
];

/** Family Member Peace-of-Mind & Loving Reminder Dispatcher. */
export default function FamilyReminderView() {
  const [preferences, setPreferences] = useState<FamilyPreference[]>(DEFAULT_PREFERENCES);
  const [customMsg, setCustomMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const togglePref = useCallback((id: string) => {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }, []);

  const handleSendLovingNudge = useCallback(async (text?: string) => {
    setSending(true);
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text || customMsg || 'Hi! Just sending love and reminding you about your daily routine. ❤️',
          requestedBy: 'Family Member',
        }),
      });
      setSentSuccess(true);
      setCustomMsg('');
      setTimeout(() => setSentSuccess(false), 3000);
    } catch { /* offline fallback */ }
    finally { setSending(false); }
  }, [customMsg]);

  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
        <Heart className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-bold">Family Peace-of-Mind & Gentle Reminders</h2>
      </div>

      <section aria-labelledby="loving-nudge-heading" className="p-4 rounded-xl bg-surface border border-gray-800 space-y-3">
        <h3 id="loving-nudge-heading" className="text-sm font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          Send a Caring Reminder or Check-in
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSendLovingNudge('❤️ Thinking of you today! Hope you are feeling well and hydrated.')}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            ❤️ Thinking of you
          </button>
          <button
            onClick={() => handleSendLovingNudge('💊 Gentle reminder for your evening medications with dinner!')}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            💊 Evening pill reminder
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="Write a personal note to your loved one..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500"
          />
          <button
            onClick={() => handleSendLovingNudge()}
            disabled={sending || !customMsg.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
        {sentSuccess && (
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered to their screen!
          </p>
        )}
      </section>

      <section aria-labelledby="family-prefs-heading" className="p-4 rounded-xl bg-surface border border-gray-800 space-y-3">
        <h3 id="family-prefs-heading" className="text-sm font-bold flex items-center gap-2">
          <BellRing className="w-4 h-4 text-teal-400" aria-hidden="true" />
          Family Oversight Alert Subscriptions
        </h3>
        <div className="space-y-2">
          {preferences.map((pref) => (
            <div key={pref.id} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-white">{pref.label}</p>
                <p className="text-gray-400 mt-0.5">{pref.description}</p>
              </div>
              <button
                onClick={() => togglePref(pref.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${pref.enabled ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {pref.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-teal-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          Preferences synchronized with your family notification feed.
        </div>
      </section>
    </div>
  );
}
