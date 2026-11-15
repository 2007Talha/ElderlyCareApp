'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ConsentPreferences, ApiResponse, UserRole } from '@/types';
import { Shield, Save, Lock } from 'lucide-react';

interface ConsentToggleProps {
  readonly role?: UserRole;
}

/** Elderly autonomy and consent toggle for sharing permissions. */
export default function ConsentToggle({ role = 'Elderly Individual' }: ConsentToggleProps) {
  const [consent, setConsent] = useState<ConsentPreferences>({
    shareWithCaretaker: true,
    shareWithFamily: true,
    allowScheduleModifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isElderly = role === 'Elderly Individual';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/consent');
        const data: ApiResponse<ConsentPreferences> = await res.json();
        if (data.success && data.data) setConsent(data.data);
      } catch { /* offline fallback */ }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    if (!isElderly) return;
    setSaving(true);
    try {
      await fetch('/api/consent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consent),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* fallback */ }
    finally { setSaving(false); }
  }, [consent, isElderly]);

  return (
    <section aria-labelledby="consent-heading" className="bg-surface border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 id="consent-heading" className="text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" aria-hidden="true" />
          Privacy & Autonomy Consent Governance
        </h2>
        {!isElderly && (
          <span className="flex items-center gap-1 text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
            <Lock className="w-3 h-3" /> Read-Only Mode
          </span>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {isElderly
          ? 'As the primary decision-maker, you have exclusive control over who can view your health data and propose schedule modifications.'
          : 'Privacy & Sharing settings are under the sole autonomy of the Elderly Individual. Caretakers and Family Members have view-only access.'}
      </p>

      <div className="space-y-3">
        <label className={`flex items-center gap-3 ${isElderly ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
          <input
            type="checkbox"
            checked={consent.shareWithCaretaker}
            disabled={!isElderly}
            onChange={(e) => setConsent({ ...consent, shareWithCaretaker: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-200">Share health data with Caretaker</span>
        </label>
        <label className={`flex items-center gap-3 ${isElderly ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
          <input
            type="checkbox"
            checked={consent.shareWithFamily}
            disabled={!isElderly}
            onChange={(e) => setConsent({ ...consent, shareWithFamily: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-200">Share health summaries with Family Members</span>
        </label>
        <label className={`flex items-center gap-3 ${isElderly ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
          <input
            type="checkbox"
            checked={consent.allowScheduleModifications}
            disabled={!isElderly}
            onChange={(e) => setConsent({ ...consent, allowScheduleModifications: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-200">Allow schedule modifications proposed by Caretakers / Family</span>
        </label>
      </div>

      {isElderly ? (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" aria-hidden="true" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Autonomy Preferences'}
        </button>
      ) : (
        <p className="mt-4 text-xs text-gray-500 italic">
          To modify these settings, please sign in with the Elderly Individual persona.
        </p>
      )}
    </section>
  );
}
