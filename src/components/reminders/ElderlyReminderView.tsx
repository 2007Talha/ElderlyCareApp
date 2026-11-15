'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Medication, Appointment } from '@/types';
import PillShapeIcon from '@/components/ui/PillShapeIcon';
import ScheduleTimelineIcon from '@/components/medications/ScheduleTimelineIcon';
import { Volume2, CheckCircle2, Clock, Calendar, Heart, Sparkles } from 'lucide-react';

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
          notes: 'Confirmed via Daily Reminders',
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
    <div className="space-y-4">
      {/* Audio Announcement Bar */}
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
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 shadow-sm"
          aria-label="Read today's reminders aloud"
        >
          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
          {speaking ? 'Reading...' : 'Read Aloud'}
        </button>
      </div>

      {/* Pending Check-In Message */}
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

      {/* Medication Reminders List */}
      <section aria-labelledby="med-reminders-heading" className="space-y-2.5">
        <h3 id="med-reminders-heading" className="font-bold text-xs uppercase tracking-wider text-gray-400">
          Medications Due Today
        </h3>
        <div className="space-y-2">
          {medications.map((med) => {
            const isSnoozed = snoozedId === med.id;
            const primaryTime = med.scheduledTimes[0] || '08:00';
            return (
              <article key={med.id} className="p-3 rounded-xl bg-surface border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-700/50 shrink-0">
                    <PillShapeIcon medicationName={med.medicationName} size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-white">{med.medicationName}</h4>
                      <span className="text-xs text-teal-400 font-semibold tabular-nums">{med.dosage}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {med.scheduledTimes.map((t) => (
                        <ScheduleTimelineIcon key={t} time={t} showLabel={false} />
                      ))}
                      <span className="text-[11px] text-gray-400">({med.frequency})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSnoozed && (
                    <span className="text-[11px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Snoozed 15m
                    </span>
                  )}
                  <button
                    onClick={() => handleTakeDose(med.id, primaryTime)}
                    disabled={loggedId === med.id}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {loggedId === med.id ? 'Saving...' : 'Took Pill'}
                  </button>
                  <button
                    onClick={() => setSnoozedId(isSnoozed ? null : med.id)}
                    className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    Snooze
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Appointment Reminders */}
      <section aria-labelledby="apt-reminders-heading" className="space-y-2">
        <h3 id="apt-reminders-heading" className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          Upcoming Doctor Appointments
        </h3>
        {appointments.slice(0, 2).map((apt) => {
          const aptDate = new Date(apt.appointmentDateTime);
          return (
            <div key={apt.id} className="p-3 rounded-xl bg-surface border border-gray-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-xs text-white">{apt.doctorName} — {apt.specialty}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{apt.location}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-amber-400 tabular-nums">
                  {aptDate.toLocaleDateString()} at {aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">{apt.preparationNotes || 'Scheduled'}</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
