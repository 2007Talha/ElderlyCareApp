'use client';

import { useState, useCallback } from 'react';
import type { Appointment, ApiResponse } from '@/types';
import { Save, X } from 'lucide-react';

interface AppointmentFormProps {
  readonly appointment: Appointment | null;
  readonly onSave: () => void;
  readonly onCancel: () => void;
}

/** Appointment create/edit form with validated fields. */
export default function AppointmentForm({ appointment, onSave, onCancel }: AppointmentFormProps) {
  const [doctor, setDoctor] = useState(appointment?.doctorName ?? '');
  const [specialty, setSpecialty] = useState(appointment?.specialty ?? '');
  const [dateTime, setDateTime] = useState(appointment?.appointmentDateTime?.slice(0, 16) ?? '');
  const [location, setLocation] = useState(appointment?.location ?? '');
  const [prepNotes, setPrepNotes] = useState(appointment?.preparationNotes ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      doctorName: doctor, specialty,
      appointmentDateTime: new Date(dateTime).toISOString(),
      location, preparationNotes: prepNotes,
    };
    const url = appointment ? `/api/appointments/${appointment.id}` : '/api/appointments';
    const method = appointment ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: ApiResponse<Appointment> = await res.json();
      if (data.success) { onSave(); }
      else { setError(data.error ?? 'Failed to save.'); }
    } catch {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  }, [doctor, specialty, dateTime, location, prepNotes, appointment, onSave]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="apt-doctor" className="block text-sm font-medium text-text-secondary mb-1">Doctor Name</label>
        <input id="apt-doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
      </div>
      <div>
        <label htmlFor="apt-specialty" className="block text-sm font-medium text-text-secondary mb-1">Specialty</label>
        <input id="apt-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
      </div>
      <div>
        <label htmlFor="apt-datetime" className="block text-sm font-medium text-text-secondary mb-1">Date & Time</label>
        <input id="apt-datetime" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
      </div>
      <div>
        <label htmlFor="apt-location" className="block text-sm font-medium text-text-secondary mb-1">Location</label>
        <input id="apt-location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
      </div>
      <div>
        <label htmlFor="apt-prep" className="block text-sm font-medium text-text-secondary mb-1">Preparation Notes</label>
        <textarea id="apt-prep" value={prepNotes} onChange={(e) => setPrepNotes(e.target.value)} rows={2} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" />
      </div>
      {error && <p className="text-danger text-sm" role="alert">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Save className="w-4 h-4" aria-hidden="true" />
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-2 bg-card-subtle hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary border border-border-color px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <X className="w-4 h-4" aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
