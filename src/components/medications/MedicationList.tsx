'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Medication, ApiResponse } from '@/types';
import MedicationForm from './MedicationForm';
import Modal from '@/components/shared/Modal';
import StatusBadge from '@/components/shared/StatusBadge';
import PillShapeIcon from '@/components/ui/PillShapeIcon';
import ScheduleTimelineIcon from './ScheduleTimelineIcon';
import { Pill, Plus, Edit, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MedicationListProps {
  readonly refreshTrigger?: number;
}

/** Medication schedule management panel with Pill Shape SVGs and timeline icons. */
export default function MedicationList({ refreshTrigger }: MedicationListProps = {}) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [lowInventory, setLowInventory] = useState<Medication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const fetchMedications = useCallback(async () => {
    try {
      const res = await fetch('/api/medications');
      const data: ApiResponse<{ medications: Medication[]; lowInventory: Medication[] }> = await res.json();
      if (data.success && data.data) {
        setMedications(data.data.medications);
        setLowInventory(data.data.lowInventory);
      }
    } catch { /* graceful offline fallback */ }
  }, []);

  useEffect(() => { fetchMedications(); }, [fetchMedications, refreshTrigger]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await fetch(`/api/medications/${id}`, { method: 'DELETE' });
      await fetchMedications();
    } catch { /* graceful fallback */ }
  }, [fetchMedications]);

  const handleSave = useCallback(() => {
    setShowForm(false);
    setEditingMed(null);
    fetchMedications();
  }, [fetchMedications]);

  return (
    <section aria-labelledby="med-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="med-heading" className="text-xl font-bold flex items-center gap-2">
          <Pill className="w-6 h-6 text-teal-400" aria-hidden="true" />
          Medication Schedule
        </h2>
        <button
          onClick={() => { setEditingMed(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white dark:border-transparent font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Medication
        </button>
      </div>

      {lowInventory.length > 0 && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg" role="alert">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            Low inventory alert: {lowInventory.map((m) => `${m.medicationName} (${m.inventoryCount} left)`).join(', ')}
          </div>
        </div>
      )}

      <div className="grid gap-4" aria-live="polite">
        {medications.map((med) => (
          <article key={med.id} className="bg-surface border border-border-color rounded-xl p-4 shadow-sm hover:border-gray-400 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-card-subtle border border-border-color shrink-0">
                  <PillShapeIcon medicationName={med.medicationName} size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base">{med.medicationName}</h3>
                  <p className="text-sm text-teal-400 font-semibold tabular-nums mt-0.5">
                    {med.dosage} — {med.frequency}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {med.scheduledTimes.map((time) => (
                      <ScheduleTimelineIcon key={time} time={time} />
                    ))}
                  </div>

                  <p className="text-xs text-text-secondary mt-2 flex items-center gap-3">
                    <span className="tabular-nums">Inventory: {med.inventoryCount}</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-text-secondary" />
                      By: {med.prescribedBy}
                    </span>
                  </p>
                  {med.instructions && (
                    <p className="text-xs text-text-secondary mt-1 italic">{med.instructions}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={med.isActive ? 'Active' : 'Inactive'} />
                <button
                  onClick={() => { setEditingMed(med); setShowForm(true); }}
                  className="text-text-secondary hover:text-teal-400 p-1.5 rounded-md hover:bg-card-subtle"
                  aria-label={`Edit ${med.medicationName}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(med.id)}
                  className="text-text-secondary hover:text-danger p-1.5 rounded-md hover:bg-card-subtle"
                  aria-label={`Delete ${med.medicationName}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingMed(null); }} title={editingMed ? 'Edit Medication' : 'Add Medication'}>
        <MedicationForm medication={editingMed} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingMed(null); }} />
      </Modal>
    </section>
  );
}
