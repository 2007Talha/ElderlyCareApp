'use client';

import { useState, useCallback } from 'react';
import type { Appointment } from '@/types';
import { HeartHandshake, Car, Send, Check } from 'lucide-react';

interface FamilyPeaceOfMindProps {
  readonly adherenceRate: number;
  readonly appointments: Appointment[];
}

/** Peace-of-mind summary and support panel for Family Member persona. */
export default function FamilyPeaceOfMind({
  adherenceRate, appointments,
}: FamilyPeaceOfMindProps) {
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [rideOffered, setRideOffered] = useState<string | null>(null);

  const handleSendNote = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    const noteText = note.trim();
    setSent(true);
    setNote('');
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Family Note: ${noteText}`, requestedBy: 'Family Member' }),
      });
    } catch { /* offline fallback */ }
    setTimeout(() => setSent(false), 3000);
  }, [note]);

  const handleOfferRide = useCallback(async (apt: Appointment) => {
    setRideOffered(apt.id);
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Family Support: Ride offered for your visit with ${apt.doctorName} on ${new Date(apt.appointmentDateTime).toLocaleDateString()}.`,
          requestedBy: 'Family Member',
        }),
      });
    } catch { /* offline fallback */ }
  }, []);

  const nextApt = appointments.find(
    (a) => new Date(a.appointmentDateTime).getTime() > Date.now()
  );

  return (
    <div className="bg-surface border border-emerald-500/30 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            Family Peace of Mind & Support
          </h3>
          <p className="text-xs text-text-secondary">Daily wellness summary and care support</p>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
          {adherenceRate >= 80 ? 'Doing Great' : 'Needs Check-in'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card-subtle rounded-lg p-3 border border-border-color">
          <p className="text-xs text-text-secondary font-medium mb-1">Upcoming Doctor Visit</p>
          {nextApt ? (
            <div className="flex items-center justify-between text-xs mt-1">
              <div>
                <p className="font-semibold text-text-primary">{nextApt.doctorName} ({nextApt.specialty})</p>
                <p className="text-text-secondary">{new Date(nextApt.appointmentDateTime).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleOfferRide(nextApt)}
                className="flex items-center gap-1 bg-accent/20 hover:bg-accent/30 text-accent text-xs px-2.5 py-1.5 rounded transition-colors"
              >
                {rideOffered === nextApt.id ? <Check className="w-3 h-3 text-success" /> : <Car className="w-3 h-3" />}
                {rideOffered === nextApt.id ? 'Ride Offered!' : 'Offer Ride'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-text-secondary">No upcoming appointments scheduled.</p>
          )}
        </div>

        <form onSubmit={handleSendNote} className="bg-card-subtle rounded-lg p-3 border border-border-color">
          <label htmlFor="family-note" className="block text-xs text-text-secondary font-medium mb-1">
            Send Love Note or Check-in
          </label>
          <div className="flex gap-2">
            <input
              id="family-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Thinking of you, drink some water!"
              className="flex-1 bg-surface border border-border-color rounded px-2.5 py-1 text-xs text-text-primary"
            />
            <button
              type="submit"
              disabled={!note.trim()}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs px-2.5 py-1 rounded transition-colors"
            >
              <Send className="w-3 h-3" />
              {sent ? 'Sent!' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
