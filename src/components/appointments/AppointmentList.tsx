'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Appointment, ApiResponse } from '@/types';
import Modal from '@/components/shared/Modal';
import AppointmentForm from './AppointmentForm';
import StatusBadge from '@/components/shared/StatusBadge';
import { Calendar, Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react';

/** Appointment management panel with full CRUD operations. */
export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments');
      const data: ApiResponse<Appointment[]> = await res.json();
      if (data.success && data.data) setAppointments(data.data);
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      await fetchAppointments();
    } catch { /* fallback */ }
  }, [fetchAppointments]);

  const handleSave = useCallback(() => {
    setShowForm(false);
    setEditingApt(null);
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <section aria-labelledby="apt-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="apt-heading" className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-400" aria-hidden="true" />
          Medical Appointments
        </h2>
        <button onClick={() => { setEditingApt(null); setShowForm(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 font-semibold text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Appointment
        </button>
      </div>

      <div className="grid gap-4" aria-live="polite">
        {appointments.map((apt) => (
          <article key={apt.id} className="bg-surface border border-border-color rounded-xl p-4 shadow-sm hover:border-gray-400 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-text-primary">{apt.doctorName}</h3>
                <p className="text-sm text-accent">{apt.specialty}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {new Date(apt.appointmentDateTime).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {apt.location}
                  </span>
                </div>
                {apt.preparationNotes && (
                  <p className="text-xs text-text-secondary mt-2">Prep: {apt.preparationNotes}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={apt.reminderStatus} />
                <button onClick={() => { setEditingApt(apt); setShowForm(true); }} className="text-text-secondary hover:text-accent p-1" aria-label={`Edit appointment with ${apt.doctorName}`}>
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(apt.id)} className="text-text-secondary hover:text-danger p-1" aria-label={`Delete appointment with ${apt.doctorName}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingApt(null); }} title={editingApt ? 'Edit Appointment' : 'Add Appointment'}>
        <AppointmentForm appointment={editingApt} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingApt(null); }} />
      </Modal>
    </section>
  );
}
