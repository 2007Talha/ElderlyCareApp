'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Medication, ApiResponse } from '@/types';
import PillShapeIcon from '@/components/ui/PillShapeIcon';
import { CheckCircle2, Volume2, BellRing, Heart } from 'lucide-react';

interface ElderlyQuickActionsProps {
  readonly medications: Medication[];
  readonly onDoseLogged: () => void;
  readonly onVoiceClick: () => void;
}

interface CheckInAlert {
  id: string;
  requestedAt: string;
  message: string;
  acknowledged: boolean;
}

/** 1-click quick-dose bar and Caretaker check-in banner for Elderly Individual. */
export default function ElderlyQuickActions({
  medications, onDoseLogged, onVoiceClick,
}: ElderlyQuickActionsProps) {
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [checkInAlert, setCheckInAlert] = useState<CheckInAlert | null>(null);
  const [confirmingCheckIn, setConfirmingCheckIn] = useState(false);

  const fetchCheckIn = useCallback(async () => {
    try {
      const res = await fetch('/api/checkin');
      const data: ApiResponse<CheckInAlert | null> = await res.json();
      if (data.success && data.data) setCheckInAlert(data.data);
      else setCheckInAlert(null);
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => {
    fetchCheckIn();
    const handleVisChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchCheckIn();
      }
    };
    window.addEventListener('focus', fetchCheckIn);
    document.addEventListener('visibilitychange', handleVisChange);
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchCheckIn();
      }
    }, 15000);
    return () => {
      window.removeEventListener('focus', fetchCheckIn);
      document.removeEventListener('visibilitychange', handleVisChange);
      clearInterval(interval);
    };
  }, [fetchCheckIn]);

  const handleConfirmSafe = useCallback(async () => {
    setConfirmingCheckIn(true);
    try {
      await fetch('/api/checkin', { method: 'PUT' });
      setCheckInAlert(null);
    } catch { /* fallback */ }
    finally { setConfirmingCheckIn(false); }
  }, []);

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
    <div className="space-y-4 mb-6">
      {checkInAlert && (
        <div className="bg-danger/15 border-2 border-danger rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse" role="alert">
          <div className="flex items-center gap-3">
            <BellRing className="w-7 h-7 text-danger shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold text-text-primary text-base">Caretaker Wellness Check-In Request</p>
              <p className="text-xs text-text-secondary">{checkInAlert.message} (Sent at {new Date(checkInAlert.requestedAt).toLocaleTimeString()})</p>
            </div>
          </div>
          <button
            onClick={handleConfirmSafe}
            disabled={confirmingCheckIn}
            className="flex items-center gap-2 bg-success hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg text-sm shrink-0 transition-colors shadow-lg"
          >
            <Heart className="w-4 h-4 fill-white" />
            {confirmingCheckIn ? 'Confirming...' : "I'm Safe & OK"}
          </button>
        </div>
      )}

      <div className="bg-surface border border-accent/30 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-text-primary text-base">My Daily Routine</h3>
            <p className="text-xs text-text-secondary">Tap to confirm you took your pill today</p>
          </div>
          <button
            onClick={onVoiceClick}
            className="flex items-center gap-1.5 text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 dark:bg-accent/20 dark:hover:bg-accent/30 dark:text-accent dark:border-accent/40 font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <Volume2 className="w-4 h-4" />
            Voice Command
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {medications.filter((m) => m.isActive).map((med) => (
            <div key={med.id} className="bg-surface border border-border-color rounded-xl p-3.5 flex items-center justify-between gap-2.5 shadow-sm hover:border-teal-400/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-card-subtle border border-border-color shrink-0">
                  <PillShapeIcon medicationName={med.medicationName} size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{med.medicationName}</p>
                  <p className="text-xs text-text-secondary tabular-nums mt-0.5">{med.dosage} • {med.scheduledTimes[0]}</p>
                </div>
              </div>
              <button
                onClick={() => handleQuickTake(med.id, med.scheduledTimes[0])}
                disabled={loggingId === med.id}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white dark:border-transparent font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                aria-label={`Mark ${med.medicationName} as taken`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-white" />
                {loggingId === med.id ? 'Saving...' : 'Took Pill'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
