'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Medication, ApiResponse } from '@/types';
import MedicationForm from './MedicationForm';
import Modal from '@/components/shared/Modal';
import StatusBadge from '@/components/shared/StatusBadge';
import { Pill, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

/** Medication schedule management panel with full CRUD operations. */
export default function MedicationList() {
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

  useEffect(() => { fetchMedications(); }, [fetchMedications]);

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
          <Pill className="w-6 h-6 text-accent" aria-hidden="true" />
          Medication Schedule
        </h2>
        <button
          onClick={() => { setEditingMed(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Medication
        </button>
      </div>

      {lowInventory.length > 0 && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg" role="alert">
          <div className="flex items-center gap-2 text-warning text-sm font-medium">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            Low inventory: {lowInventory.map((m) => `${m.medicationName} (${m.inventoryCount} left)`).join(', ')}
          </div>
        </div>
      )}

      <div className="grid gap-4" aria-live="polite">
        {medications.map((med) => (
          <article key={med.id} className="bg-surface border border-gray-800 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{med.medicationName}</h3>
                <p className="text-sm text-gray-400">{med.dosage} — {med.frequency}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Times: {med.scheduledTimes.join(', ')} | Inventory: {med.inventoryCount} | By: {med.prescribedBy}
                </p>
                {med.instructions && <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={med.isActive ? 'Active' : 'Inactive'} />
                <button onClick={() => { setEditingMed(med); setShowForm(true); }} className="text-gray-400 hover:text-accent p-1" aria-label={`Edit ${med.medicationName}`}>
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(med.id)} className="text-gray-400 hover:text-danger p-1" aria-label={`Delete ${med.medicationName}`}>
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
