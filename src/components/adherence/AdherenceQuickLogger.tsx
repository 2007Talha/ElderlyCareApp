'use client';

import React from 'react';
import type { Medication, DoseStatus } from '@/types';
import PillShapeIcon from '@/components/ui/PillShapeIcon';
import ScheduleTimelineIcon from '@/components/medications/ScheduleTimelineIcon';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdherenceQuickLoggerProps {
  readonly activeMeds: Medication[];
  readonly loggingMedId: string | null;
  readonly onDirectLog: (medId: string, time: string, status: DoseStatus) => void;
}

/** Active medications quick intake logger subcard for Adherence Tracker. */
export default function AdherenceQuickLogger({
  activeMeds,
  loggingMedId,
  onDirectLog,
}: AdherenceQuickLoggerProps) {
  return (
    <div className="bg-surface border border-border-color rounded-xl p-5 mb-6 shadow-sm">
      <h3 className="font-bold text-text-primary text-base mb-1">
        Active Medications — Quick Intake Logger
      </h3>
      <p className="text-xs text-text-secondary mb-4">
        All added medications appear here. Click to mark intake status instantly:
      </p>

      {activeMeds.length === 0 ? (
        <p className="text-xs text-text-secondary italic">
          No active medications scheduled. Add one in the Medications tab.
        </p>
      ) : (
        <div className="space-y-3">
          {activeMeds.map((med) => (
            <div
              key={med.id}
              className="p-3.5 rounded-xl bg-card-subtle border border-border-color flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface border border-border-color shrink-0">
                  <PillShapeIcon medicationName={med.medicationName} size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-text-primary text-sm">{med.medicationName}</p>
                    <span className="text-xs text-teal-400 font-semibold tabular-nums">{med.dosage}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {med.scheduledTimes.map((time) => (
                      <ScheduleTimelineIcon key={time} time={time} showLabel={false} />
                    ))}
                    <span className="text-[11px] text-text-secondary tabular-nums ml-1">
                      (Inventory: {med.inventoryCount})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onDirectLog(med.id, med.scheduledTimes[0] || '08:00', 'Taken')}
                  disabled={loggingMedId === `${med.id}-Taken`}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Taken
                </button>
                <button
                  onClick={() => onDirectLog(med.id, med.scheduledTimes[0] || '08:00', 'Missed')}
                  disabled={loggingMedId === `${med.id}-Missed`}
                  className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Missed
                </button>
                <button
                  onClick={() => onDirectLog(med.id, med.scheduledTimes[0] || '08:00', 'Snoozed')}
                  disabled={loggingMedId === `${med.id}-Snoozed`}
                  className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Snooze
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
