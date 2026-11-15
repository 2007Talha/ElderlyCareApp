'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Medication, Appointment } from '@/types';
import { ElderlyMedicationCard } from './ElderlyMedicationCard';
import { speakDailyReminders } from '@/utils/helpers';
import { Volume2, Calendar, Heart, Sparkles } from 'lucide-react';

interface CheckInAlert {
  id: string;
  requestedAt: string;
  message: string;
  acknowledged: boolean;
}

/** Elderly-focused reminder center with compact typography and 1-click dose confirmation. */
export default function ElderlyReminderView() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [checkInAlert, setCheckInAlert] = useState<CheckInAlert | null>(null);
  const [snoozedId, setSnoozedId] = useState<string | null>(null);
  const [loggedId, setLoggedId] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [mRes, aRes, cRes] = await Promise.all([
        fetch('/api/medications'), fetch('/api/appointments'), fetch('/api/checkin'),
      ]);
      const [mData, aData, cData] = await Promise.all([mRes.json(), aRes.json(), cRes.json()]);
      if (mData.success && mData.data?.medications) setMedications(mData.data.medications);
      if (aData.success && aData.data) setAppointments(aData.data);
      if (cData.success && cData.data) setCheckInAlert(cData.data);
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTakeDose = useCallback(async (medId: string, time: string) => {
    setLoggedId(medId);
    try {
      await fetch('/api/adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medId, status: 'Taken', scheduledTime: time,
          recordedBy: 'Elderly Individual', notes: 'Confirmed via Daily Reminders',
        }),
      });
      await fetchData();
    } catch { /* fallback */ }
    finally { setLoggedId(null); }
  }, [fetchData]);

  const handleAcknowledgeCheckIn = useCallback(async () => {
    try {
      await fetch('/api/checkin', { method: 'PUT' });
      setCheckInAlert(null);
    } catch { /* fallback */ }
  }, []);

  const handleToggleSnooze = useCallback((id: string) => {
    setSnoozedId((prev) => (prev === id ? null : id));
  }, []);

  const handleSpeak = useCallback(() => {
    setSpeaking(true);
    speakDailyReminders(medications, appointments);
    setTimeout(() => setSpeaking(false), 5000);
  }, [medications, appointments]);

  const activeMeds = useMemo(() => medications.filter((m) => m.isActive), [medications]);
  const upcomingApts = useMemo(() => appointments.slice(0, 2), [appointments]);

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
          <p className="text-xs text-gray-300">
            Listen to your daily routine or tap <strong className="text-teal-400">Took Pill</strong> to confirm doses.
          </p>
        </div>
        <button
          onClick={handleSpeak}
          disabled={speaking}
          className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white dark:border-transparent disabled:opacity-50 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 shadow-sm"
          aria-label="Read today's reminders aloud"
        >
          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
          {speaking ? 'Reading...' : 'Read Aloud'}
        </button>
      </div>

      {checkInAlert && (
        <aside aria-label="Incoming check-in alert" className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-xs text-white">Check-In From Care Team</p>
              <p className="text-[11px] text-gray-300 mt-0.5">{checkInAlert.message}</p>
            </div>
          </div>
          <button
            onClick={handleAcknowledgeCheckIn}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm shrink-0"
          >
            I Am OK 👍
          </button>
        </aside>
      )}

      <section aria-labelledby="med-reminders-heading" className="space-y-2.5">
        <h3 id="med-reminders-heading" className="font-bold text-xs uppercase tracking-wider text-gray-400">
          Medications Due Today
        </h3>
        <div className="space-y-2">
          {activeMeds.map((med) => (
            <ElderlyMedicationCard
              key={med.id}
              med={med}
              isSnoozed={snoozedId === med.id}
              isLogging={loggedId === med.id}
              onTakeDose={handleTakeDose}
              onToggleSnooze={handleToggleSnooze}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="apt-reminders-heading" className="space-y-2">
        <h3 id="apt-reminders-heading" className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          Upcoming Doctor Appointments
        </h3>
        {upcomingApts.map((apt) => {
          const d = new Date(apt.appointmentDateTime);
          return (
            <div key={apt.id} className="p-3 rounded-xl bg-surface border border-border-color flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-xs text-text-primary">{apt.doctorName} — {apt.specialty}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">{apt.location}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-amber-500 tabular-nums">
                  {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className="text-[11px] text-text-secondary mt-0.5">{apt.preparationNotes || 'Scheduled'}</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
