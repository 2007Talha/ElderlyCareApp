'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Medication, Appointment, ApiResponse } from '@/types';
import PillShapeIcon from '@/components/ui/PillShapeIcon';
import ScheduleTimelineIcon from '@/components/medications/ScheduleTimelineIcon';
import { Volume2, CheckCircle2, Clock, Calendar, Heart, BellRing, Sparkles } from 'lucide-react';

interface CheckInAlert {
  id: string;
  requestedAt: string;
  message: string;
  acknowledged: boolean;
}

/** Audio announcement helper for elderly reminders. */
function speakReminders(meds: Medication[], apts: Appointment[]) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const medNames = meds.map((m) => `${m.medicationName} at ${m.scheduledTimes.join(', ')}`).join('. ');
  const aptNames = apts.length > 0
    ? `Upcoming appointment with ${apts[0].doctorName} on ${new Date(apts[0].appointmentDateTime).toLocaleDateString()}.`
    : 'No appointments today.';
  const speech = new SpeechSynthesisUtterance(`Here are your daily reminders. Medications: ${medNames}. ${aptNames}`);
  speech.rate = 0.9;
  window.speechSynthesis.speak(speech);
}

/** Elderly-focused reminder center with audio speech and 1-click dose confirmation. */
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
      const mData = await mRes.json();
      const aData = await aRes.json();
      const cData = await cRes.json();
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
          medicationId: medId,
          status: 'Taken',
          scheduledTime: time,
          recordedBy: 'Elderly Individual',
          notes: 'Confirmed via Elderly Reminders View',
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

  const handleSpeak = useCallback(() => {
    setSpeaking(true);
    speakReminders(medications, appointments);
    setTimeout(() => setSpeaking(false), 5000);
  }, [medications, appointments]);

  return (
    <div className="space-y-6">
      {/* Audio Announcement Header */}
      <div className="p-5 rounded-2xl bg-teal-500/10 border-2 border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BellRing className="w-6 h-6 text-teal-400" aria-hidden="true" />
            My Daily Reminders
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Tap &quot;Take Pill Now&quot; to confirm your medicine or listen to your schedule aloud.
          </p>
        </div>
        <button
          onClick={handleSpeak}
          disabled={speaking}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-3 rounded-xl font-bold text-base shadow-md transition-all active:scale-95 self-start sm:self-auto"
          aria-label="Read today's reminders aloud"
        >
          <Volume2 className="w-5 h-5" aria-hidden="true" />
          {speaking ? 'Reading Aloud...' : 'Read Aloud'}
        </button>
      </div>

      {/* Pending Check-In Message */}
      {checkInAlert && (
        <aside aria-label="Incoming check-in alert" className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <Heart className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-base">Check-In From Care Team</p>
              <p className="text-sm text-gray-300 mt-0.5">{checkInAlert.message}</p>
            </div>
          </div>
          <button
            onClick={handleAcknowledgeCheckIn}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md self-start sm:self-auto"
          >
            I Am Doing Well! 👍
          </button>
        </aside>
      )}

      {/* Medication Reminders List */}
      <section aria-labelledby="med-reminders-heading" className="space-y-4">
        <h3 id="med-reminders-heading" className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" aria-hidden="true" />
          Medications Due Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => {
            const isSnoozed = snoozedId === med.id;
            const primaryTime = med.scheduledTimes[0] || '08:00';
            return (
              <article key={med.id} className="p-5 rounded-2xl bg-surface border-2 border-stone-200 dark:border-gray-800 shadow-sm flex flex-col justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-stone-100 dark:bg-gray-800/80 border border-stone-200 dark:border-gray-700/60 shrink-0">
                    <PillShapeIcon medicationName={med.medicationName} size={36} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{med.medicationName}</h4>
                    <p className="text-sm text-teal-500 font-semibold tabular-nums mt-0.5">{med.dosage} • {med.frequency}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {med.scheduledTimes.map((t) => (
                        <ScheduleTimelineIcon key={t} time={t} showLabel={true} />
                      ))}
                    </div>
                  </div>
                </div>

                {isSnoozed && (
                  <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Snoozed for 15 minutes. We will remind you again soon!
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-stone-200 dark:border-gray-800">
                  <button
                    onClick={() => handleTakeDose(med.id, primaryTime)}
                    disabled={loggedId === med.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md active:scale-98"
                  >
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    {loggedId === med.id ? 'Recording...' : 'Take Pill Now'}
                  </button>
                  <button
                    onClick={() => setSnoozedId(isSnoozed ? null : med.id)}
                    className="flex items-center justify-center gap-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-stone-800 dark:text-gray-200 font-semibold py-3 px-3.5 rounded-xl text-sm transition-colors"
                  >
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Snooze
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Appointment Reminders */}
      <section aria-labelledby="apt-reminders-heading" className="space-y-3">
        <h3 id="apt-reminders-heading" className="font-bold text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" aria-hidden="true" />
          Upcoming Doctor Appointments
        </h3>
        {appointments.slice(0, 2).map((apt) => {
          const aptDate = new Date(apt.appointmentDateTime);
          return (
            <div key={apt.id} className="p-4 rounded-xl bg-surface border border-stone-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-base">{apt.doctorName} — {apt.specialty}</p>
                <p className="text-xs text-gray-400 mt-1">{apt.location}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-amber-400 tabular-nums">
                  {aptDate.toLocaleDateString()} at {aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">{apt.preparationNotes || 'Scheduled'}</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
