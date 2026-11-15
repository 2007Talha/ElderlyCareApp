'use client';

import React, { useState, useCallback } from 'react';
import type { Medication, DoseStatus } from '@/types';
import { DOSE_STATUSES } from '@/config/constants';

interface AdherenceManualFormProps {
  readonly activeMeds: readonly Medication[];
  readonly onSave: (medId: string, time: string, status: DoseStatus) => void;
}

/** Form for recording manual or past medication doses with full accessibility. */
function AdherenceManualFormComponent({ activeMeds, onSave }: AdherenceManualFormProps) {
  const [selectedMed, setSelectedMed] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DoseStatus>('Taken');
  const [selectedTime, setSelectedTime] = useState('');

  const handleMedSelect = useCallback((medId: string) => {
    setSelectedMed(medId);
    const med = activeMeds.find((m) => m.id === medId);
    if (med && med.scheduledTimes.length > 0) setSelectedTime(med.scheduledTimes[0]);
  }, [activeMeds]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed || !selectedTime) return;
    onSave(selectedMed, selectedTime, selectedStatus);
    setSelectedMed('');
    setSelectedTime('');
  }, [selectedMed, selectedTime, selectedStatus, onSave]);

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border-color rounded-xl p-5 mb-6 shadow-sm">
      <h3 className="font-bold text-text-primary text-sm mb-3">Custom Dose Entry</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="adh-med" className="block text-xs font-semibold text-text-secondary mb-1">Medication</label>
          <select
            id="adh-med"
            value={selectedMed}
            onChange={(e) => handleMedSelect(e.target.value)}
            className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary text-sm focus:border-teal-400"
            required
          >
            <option value="">Select medication...</option>
            {activeMeds.map((m) => (
              <option key={m.id} value={m.id}>{m.medicationName} ({m.dosage})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="adh-status" className="block text-xs font-semibold text-text-secondary mb-1">Status</label>
          <select
            id="adh-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as DoseStatus)}
            className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary text-sm focus:border-teal-400"
          >
            {DOSE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="adh-time" className="block text-xs font-semibold text-text-secondary mb-1">Scheduled Time</label>
          <input
            id="adh-time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary text-sm focus:border-teal-400 tabular-nums"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-3.5 bg-teal-600 hover:bg-teal-500 font-semibold text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
      >
        Log Custom Dose
      </button>
    </form>
  );
}

export const AdherenceManualForm = React.memo(AdherenceManualFormComponent);
