'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ConsentPreferences, ApiResponse } from '@/types';
import { Shield, Save } from 'lucide-react';

/** Elderly autonomy and consent toggle for sharing permissions. */
export default function ConsentToggle() {
  const [consent, setConsent] = useState<ConsentPreferences>({
    shareWithCaretaker: true,
    shareWithFamily: true,
    allowScheduleModifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
  }, [consent]);

  return (
    <section aria-labelledby="consent-heading" className="bg-surface border border-gray-800 rounded-xl p-6">
      <h2 id="consent-heading" className="text-lg font-bold flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-accent" aria-hidden="true" />
        Privacy & Consent Settings
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Control who can view your health data and modify your schedules.
      </p>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={consent.shareWithCaretaker} onChange={(e) => setConsent({ ...consent, shareWithCaretaker: e.target.checked })} className="rounded" />
          <span className="text-sm text-gray-200">Share data with Caretaker</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={consent.shareWithFamily} onChange={(e) => setConsent({ ...consent, shareWithFamily: e.target.checked })} className="rounded" />
          <span className="text-sm text-gray-200">Share data with Family Member</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={consent.allowScheduleModifications} onChange={(e) => setConsent({ ...consent, allowScheduleModifications: e.target.checked })} className="rounded" />
          <span className="text-sm text-gray-200">Allow schedule modifications by others</span>
        </label>
      </div>

      <button onClick={handleSave} disabled={saving} className="mt-4 flex items-center gap-2 bg-accent hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm">
        <Save className="w-4 h-4" aria-hidden="true" />
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
      </button>
    </section>
  );
}
