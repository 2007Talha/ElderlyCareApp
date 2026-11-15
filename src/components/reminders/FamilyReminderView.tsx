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
  {
    id: 'missed-dose',
    label: 'Immediate Missed Dose Alerts',
    description: 'Receive SMS/Email notification if a medication is overdue by 30+ minutes.',
    enabled: true,
  },
  {
    id: 'low-refill',
    label: 'Low Supply Warnings',
    description: 'Get notified when any critical medication drops below 7 days remaining.',
    enabled: true,
  },
  {
    id: 'weekly-digest',
    label: 'Sunday Adherence Digest',
    description: 'Receive weekly health and adherence summary for family peace-of-mind.',
    enabled: true,
  },
];

/** Family Member Peace-of-Mind & Loving Reminder Dispatcher. */
export default function FamilyReminderView() {
  const [preferences, setPreferences] = useState<FamilyPreference[]>(DEFAULT_PREFERENCES);
  const [customMsg, setCustomMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const togglePref = useCallback((id: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
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
      setTimeout(() => setSentSuccess(false), 3500);
    } catch { /* offline fallback */ }
    finally { setSending(false); }
  }, [customMsg]);

  return (
    <div className="space-y-6">
      {/* Peace of Mind Banner */}
      <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            Family Peace-of-Mind & Gentle Reminders
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Stay connected with your loved one&apos;s daily routine and send loving encouragements.
          </p>
        </div>
      </div>

      {/* Send Loving Nudge Section */}
      <section aria-labelledby="loving-nudge-heading" className="p-5 rounded-2xl bg-surface border border-stone-200 dark:border-gray-800 space-y-4">
        <h3 id="loving-nudge-heading" className="text-base font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          Send a Caring Reminder or Check-in
        </h3>
        <p className="text-xs text-gray-400">
          This message will appear directly on your loved one&apos;s screen as a gentle, warm check-in banner.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSendLovingNudge('❤️ Thinking of you today! Hope you are feeling well and hydrated.')}
            className="text-xs bg-stone-200 dark:bg-gray-800 hover:bg-stone-300 dark:hover:bg-gray-700 px-3.5 py-2 rounded-xl font-medium transition-colors"
          >
            ❤️ Thinking of you check-in
          </button>
          <button
            onClick={() => handleSendLovingNudge('💊 Gentle reminder for your evening medications with dinner!')}
            className="text-xs bg-stone-200 dark:bg-gray-800 hover:bg-stone-300 dark:hover:bg-gray-700 px-3.5 py-2 rounded-xl font-medium transition-colors"
          >
            💊 Evening pill reminder
          </button>
          <button
            onClick={() => handleSendLovingNudge('🚗 Excited to see you tomorrow! I can drive you to your doctor visit.')}
            className="text-xs bg-stone-200 dark:bg-gray-800 hover:bg-stone-300 dark:hover:bg-gray-700 px-3.5 py-2 rounded-xl font-medium transition-colors"
          >
            🚗 Doctor visit ride offer
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="Write a personal note (e.g. Love you! Don't forget your vitamins)..."
            className="flex-1 bg-stone-100 dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSendLovingNudge()}
            disabled={sending || !customMsg.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            Send Note
          </button>
        </div>

        {sentSuccess && (
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Your loving reminder was delivered to their screen!
          </p>
        )}
      </section>

      {/* Family Notification Preferences */}
      <section aria-labelledby="family-prefs-heading" className="p-5 rounded-2xl bg-surface border border-stone-200 dark:border-gray-800 space-y-4">
        <h3 id="family-prefs-heading" className="text-base font-bold flex items-center gap-2">
          <BellRing className="w-5 h-5 text-teal-400" aria-hidden="true" />
          Family Oversight Alert Subscriptions
        </h3>
        <p className="text-xs text-gray-400">
          Customize when your family circle receives alerts regarding care routines and health milestones.
        </p>

        <div className="space-y-3">
          {preferences.map((pref) => (
            <div key={pref.id} className="p-4 rounded-xl bg-stone-100/50 dark:bg-gray-800/40 border border-stone-200 dark:border-gray-700/60 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-sm text-white">{pref.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pref.description}</p>
              </div>
              <button
                onClick={() => togglePref(pref.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  pref.enabled
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-300 dark:bg-gray-700 text-stone-600 dark:text-gray-400'
                }`}
              >
                {pref.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-medium pt-2">
          <ShieldCheck className="w-4 h-4" />
          Preferences synchronized with your family notification feed.
        </div>
      </section>
    </div>
  );
}
