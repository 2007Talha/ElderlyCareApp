'use client';

import React from 'react';
import type { Medication, DrugInteraction } from '@/types';
import PillShapeIcon from '@/components/ui/PillShapeIcon';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface PrescriptionResultCardProps {
  readonly addedMed: Medication;
  readonly interactions: DrugInteraction[];
}

/** Accessible visual card displaying newly scanned and scheduled medication. */
export default function PrescriptionResultCard({
  addedMed,
  interactions,
}: PrescriptionResultCardProps) {
  return (
    <div className="mt-2 p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
          <span>Added to Medication Schedule!</span>
        </div>
        <span className="text-xs text-teal-400/90 font-medium bg-teal-500/20 px-2 py-0.5 rounded-full">
          30 Doses Stocked
        </span>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <div className="p-2 rounded-lg bg-card-subtle border border-border-color shrink-0">
          <PillShapeIcon medicationName={addedMed.medicationName} size={28} />
        </div>
        <div>
          <p className="font-bold text-text-primary text-base">{addedMed.medicationName}</p>
          <p className="text-xs text-teal-400 font-semibold mt-0.5">
            {addedMed.dosage} — {addedMed.frequency} (Times: {addedMed.scheduledTimes.join(', ')})
          </p>
          <p className="text-[11px] text-text-secondary mt-1 italic">{addedMed.instructions}</p>
        </div>
      </div>

      {interactions.length > 0 && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-500 flex items-start gap-2" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Drug Interaction Alert:</p>
            {interactions.map((i, idx) => (
              <p key={idx} className="text-[11px] text-text-secondary">{i.description}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
