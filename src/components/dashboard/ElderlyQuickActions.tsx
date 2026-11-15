'use client';

import { useState, useCallback } from 'react';
import type { Medication } from '@/types';
import { CheckCircle2, Volume2 } from 'lucide-react';

interface ElderlyQuickActionsProps {
  readonly medications: Medication[];
  readonly onDoseLogged: () => void;
  readonly onVoiceClick: () => void;
}

/** 1-click quick-dose bar for Elderly Individual on their dashboard. */
export default function ElderlyQuickActions({
  medications, onDoseLogged, onVoiceClick,
}: ElderlyQuickActionsProps) {
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const handleQuickTake = useCallback(async (medId: string, time: string) => {
    setLoggingId(medId);
    try {
      await fetch('/api/adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medId,
          status: 'Taken',
          scheduledTime: time,
          recordedBy: 'Elderly Individual',
          notes: 'Logged via 1-click Elderly Quick Action',
        }),
      });
      onDoseLogged();
    } catch { /* offline fallback */ }
    finally { setLoggingId(null); }
  }, [onDoseLogged]);

  return (
    <div className="bg-surface border border-accent/30 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-base">My Daily Routine</h3>
          <p className="text-xs text-gray-400">Tap to confirm you took your pill today</p>
        </div>
        <button
          onClick={onVoiceClick}
          className="flex items-center gap-1.5 text-xs bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Voice Command
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {medications.filter((m) => m.isActive).map((med) => (
          <div key={med.id} className="bg-gray-800/80 border border-gray-700/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{med.medicationName}</p>
              <p className="text-xs text-gray-400">{med.dosage} • {med.scheduledTimes[0]}</p>
            </div>
            <button
              onClick={() => handleQuickTake(med.id, med.scheduledTimes[0])}
              disabled={loggingId === med.id}
              className="flex items-center gap-1 bg-success hover:bg-emerald-600 disabled:opacity-50 text-white text-xs px-2.5 py-1.5 rounded-md transition-colors"
              aria-label={`Mark ${med.medicationName} as taken`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {loggingId === med.id ? 'Saving...' : 'Took Pill'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
