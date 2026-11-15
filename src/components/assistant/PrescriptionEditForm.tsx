'use client';

import React, { useState } from 'react';
import type { PrescriptionScanResult } from '@/types';
import { Check, X, Pill } from 'lucide-react';

interface PrescriptionEditFormProps {
  readonly previewUrl: string | null;
  readonly initialData: PrescriptionScanResult;
  readonly onSave: (data: PrescriptionScanResult) => Promise<void>;
  readonly onCancel: () => void;
  readonly saving: boolean;
}

const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Once daily at bedtime',
];

interface FieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (val: string) => void;
  readonly required?: boolean;
  readonly placeholder?: string;
}

function FormInput({ label, value, onChange, required, placeholder }: FieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-text-secondary mb-1">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
    </div>
  );
}

/** Review and edit extracted prescription label OCR data before saving. */
export default function PrescriptionEditForm({
  previewUrl,
  initialData,
  onSave,
  onCancel,
  saving,
}: PrescriptionEditFormProps) {
  const [form, setForm] = useState<PrescriptionScanResult>(initialData);

  const setField = (key: keyof PrescriptionScanResult) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(form);
      }}
      className="mt-3 p-4 rounded-xl bg-surface border border-border-color space-y-3.5 shadow-sm"
    >
      <div className="flex items-center justify-between pb-2 border-b border-border-color">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-teal-400" aria-hidden="true" />
          <h4 className="font-semibold text-sm text-text-primary">Confirm Scanned Details</h4>
        </div>
        <span className="text-[11px] text-teal-400 font-medium bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
          AI Extracted
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3.5 items-start">
        {previewUrl && (
          <div className="w-full sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden border border-border-color bg-surface flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Uploaded prescription preview" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 w-full">
          <FormInput label="Medication Name" value={form.medicationName} onChange={setField('medicationName')} required />
          <FormInput label="Dosage" value={form.dosage} onChange={setField('dosage')} required />

          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">Frequency</label>
            <select
              value={form.frequency}
              onChange={(e) => setField('frequency')(e.target.value)}
              className="w-full bg-surface border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <FormInput label="Prescribed By" value={form.prescribedBy || ''} onChange={setField('prescribedBy')} placeholder="Dr. or Clinic" />

          <div className="sm:col-span-2">
            <FormInput label="Instructions" value={form.instructions || ''} onChange={setField('instructions')} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-color">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-text-secondary hover:text-text-primary bg-surface border border-border-color transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white dark:border-transparent shadow-sm transition-colors disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          {saving ? 'Adding to Schedule...' : 'Apply & Save to Schedule'}
        </button>
      </div>
    </form>
  );
}
