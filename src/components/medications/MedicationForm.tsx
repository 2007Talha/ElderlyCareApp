'use client';

import { useState, useCallback } from 'react';
import type { Medication, ApiResponse, DrugInteraction } from '@/types';
import { Save, X, AlertTriangle } from 'lucide-react';

interface MedicationFormProps {
  readonly medication: Medication | null;
  readonly onSave: () => void;
  readonly onCancel: () => void;
}

/** Medication create/edit form with Zod validation and drug interaction warnings. */
export default function MedicationForm({ medication, onSave, onCancel }: MedicationFormProps) {
  const [name, setName] = useState(medication?.medicationName ?? '');
  const [dosage, setDosage] = useState(medication?.dosage ?? '');
  const [frequency, setFrequency] = useState(medication?.frequency ?? '');
  const [times, setTimes] = useState(medication?.scheduledTimes.join(',') ?? '');
  const [inventory, setInventory] = useState(medication?.inventoryCount ?? 30);
  const [instructions, setInstructions] = useState(medication?.instructions ?? '');
  const [prescribedBy, setPrescribedBy] = useState(medication?.prescribedBy ?? '');
  const [isActive, setIsActive] = useState(medication?.isActive ?? true);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      medicationName: name, dosage, frequency,
      scheduledTimes: times.split(',').map((t) => t.trim()),
      inventoryCount: inventory, instructions, prescribedBy, isActive,
    };
    const url = medication ? `/api/medications/${medication.id}` : '/api/medications';
    const method = medication ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: ApiResponse<{ interactions?: DrugInteraction[] }> = await res.json();
      if (data.success) {
        if (data.data?.interactions?.length) {
          setInteractions(data.data.interactions);
        }
        onSave();
      } else {
        setError(data.error ?? 'Failed to save.');
      }
    } catch {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  }, [name, dosage, frequency, times, inventory, instructions, prescribedBy, isActive, medication, onSave]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="med-name" className="block text-sm font-medium text-text-secondary mb-1">Medication Name</label>
        <input id="med-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="med-dosage" className="block text-sm font-medium text-text-secondary mb-1">Dosage</label>
          <input id="med-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
        </div>
        <div>
          <label htmlFor="med-frequency" className="block text-sm font-medium text-text-secondary mb-1">Frequency</label>
          <input id="med-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
        </div>
      </div>
      <div>
        <label htmlFor="med-times" className="block text-sm font-medium text-text-secondary mb-1">Scheduled Times (comma-separated)</label>
        <input id="med-times" value={times} onChange={(e) => setTimes(e.target.value)} placeholder="08:00, 20:00" className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="med-inventory" className="block text-sm font-medium text-text-secondary mb-1">Inventory Count</label>
          <input id="med-inventory" type="number" value={inventory} onChange={(e) => setInventory(Number(e.target.value))} min={0} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
        </div>
        <div>
          <label htmlFor="med-prescriber" className="block text-sm font-medium text-text-secondary mb-1">Prescribed By</label>
          <input id="med-prescriber" value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" required />
        </div>
      </div>
      <div>
        <label htmlFor="med-instructions" className="block text-sm font-medium text-text-secondary mb-1">Instructions</label>
        <textarea id="med-instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-text-primary" />
      </div>
      <div className="flex items-center gap-2">
        <input id="med-active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
        <label htmlFor="med-active" className="text-sm text-text-secondary">Active</label>
      </div>

      {interactions.length > 0 && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg" role="alert">
          <p className="flex items-center gap-2 text-danger font-medium text-sm">
            <AlertTriangle className="w-4 h-4" /> Drug Interaction Warnings
          </p>
          {interactions.map((i, idx) => (
            <p key={idx} className="text-xs text-text-secondary mt-1">{i.drugA} + {i.drugB}: {i.description}</p>
          ))}
        </div>
      )}

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
