'use client';

import React from 'react';
import type { Medication } from '@/types';
import PillShapeIcon from '@/components/ui/PillShapeIcon';
import ScheduleTimelineIcon from '@/components/medications/ScheduleTimelineIcon';
import { CheckCircle2, Clock } from 'lucide-react';

interface ElderlyMedicationCardProps {
  readonly med: Medication;
  readonly isSnoozed: boolean;
  readonly isLogging: boolean;
  readonly onTakeDose: (medId: string, time: string) => void;
  readonly onToggleSnooze: (medId: string) => void;
}

/**
 * Accessible, memoized medication card for the elderly reminder stream.
 */
function ElderlyMedicationCardComponent({
  med, isSnoozed, isLogging, onTakeDose, onToggleSnooze,
}: ElderlyMedicationCardProps) {
  const primaryTime = med.scheduledTimes[0] || '08:00';

  return (
    <article className="p-3 rounded-xl bg-surface border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
          onClick={() => onTakeDose(med.id, primaryTime)}
          disabled={isLogging}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          {isLogging ? 'Saving...' : 'Took Pill'}
        </button>
        <button
          onClick={() => onToggleSnooze(med.id)}
          className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        >
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          Snooze
        </button>
      </div>
    </article>
  );
}

export const ElderlyMedicationCard = React.memo(ElderlyMedicationCardComponent);
