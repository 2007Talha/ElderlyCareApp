'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AdherenceRecord, Medication, ApiResponse, DoseStatus } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import AdherenceQuickLogger from './AdherenceQuickLogger';
import { AdherenceManualForm } from './AdherenceManualForm';
import { Activity, CheckCircle, XCircle, Clock, SkipForward } from 'lucide-react';

interface AdherenceData {
  records: AdherenceRecord[];
  rate: number;
  streak: number;
  breakdown: Record<DoseStatus, number>;
}

const statusIcons: Record<string, React.ReactNode> = {
  Taken: <CheckCircle className="w-4 h-4 text-success" />,
  Missed: <XCircle className="w-4 h-4 text-danger" />,
  Snoozed: <Clock className="w-4 h-4 text-warning" />,
  Skipped: <SkipForward className="w-4 h-4 text-gray-400" />,
};

/** Adherence tracking panel with metrics and dose loggers. */
export default function AdherenceTracker() {
  const [data, setData] = useState<AdherenceData | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loggingMedId, setLoggingMedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [adhRes, medRes] = await Promise.all([
        fetch('/api/adherence'), fetch('/api/medications'),
      ]);
      const [adhData, medData]: [ApiResponse<AdherenceData>, ApiResponse<{ medications: Medication[] }>] =
        await Promise.all([adhRes.json(), medRes.json()]);
      if (adhData.success && adhData.data) setData(adhData.data);
      if (medData.success && medData.data) setMedications(medData.data.medications);
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDirectLog = useCallback(async (medId: string, time: string, status: DoseStatus) => {
    setLoggingMedId(`${medId}-${status}`);
    try {
      await fetch('/api/adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medId, status, scheduledTime: time,
          recordedBy: 'Elderly Individual', notes: `Logged directly via Adherence Panel (${status})`,
        }),
      });
      await fetchData();
    } catch { /* fallback */ }
    finally { setLoggingMedId(null); }
  }, [fetchData]);

  const handleManualSave = useCallback(async (medId: string, time: string, status: DoseStatus) => {
    try {
      await fetch('/api/adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medId, status, scheduledTime: time,
          recordedBy: 'Elderly Individual', notes: 'Manual custom entry',
        }),
      });
      await fetchData();
    } catch { /* fallback */ }
  }, [fetchData]);

  const activeMeds = useMemo(() => medications.filter((m) => m.isActive), [medications]);
  const medNameMap = useMemo(() => new Map(medications.map((m) => [m.id, m.medicationName])), [medications]);
  const recentRecords = useMemo(() => (data?.records.slice(-10).reverse() ?? []), [data?.records]);

  return (
    <section aria-labelledby="adherence-heading">
      <h2 id="adherence-heading" className="text-xl font-bold flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-teal-400" aria-hidden="true" />
        Medication Adherence & Dose Logging
      </h2>

      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6" aria-live="polite">
          <div className="bg-surface border border-border-color rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-success tabular-nums">{data.rate}%</p>
            <p className="text-sm text-text-secondary font-medium">Adherence Rate</p>
          </div>
          <div className="bg-surface border border-border-color rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-teal-400 tabular-nums">{data.streak}</p>
            <p className="text-sm text-text-secondary font-medium">Day Streak</p>
          </div>
          <div className="bg-surface border border-border-color rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-amber-500 tabular-nums">{data.breakdown.Missed}</p>
            <p className="text-sm text-text-secondary font-medium">Missed Doses</p>
          </div>
        </div>
      )}

      <AdherenceQuickLogger
        activeMeds={activeMeds}
        loggingMedId={loggingMedId}
        onDirectLog={handleDirectLog}
      />

      <AdherenceManualForm activeMeds={activeMeds} onSave={handleManualSave} />

      <div className="space-y-2" aria-live="polite">
        <h3 className="font-bold text-text-primary text-sm mb-2">Recent Adherence Activity</h3>
        {recentRecords.map((r) => (
          <div key={r.id} className="flex items-center justify-between bg-surface border border-border-color rounded-lg px-4 py-2.5 hover:border-gray-400 dark:hover:border-gray-700 transition-colors shadow-sm">
            <div className="flex items-center gap-2.5">
              {statusIcons[r.status]}
              <span className="text-sm font-semibold text-text-primary">
                {medNameMap.get(r.medicationId) ?? r.medicationId}
              </span>
              <span className="text-xs text-text-secondary tabular-nums">({r.scheduledTime})</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={r.status} />
              <span className="text-xs text-text-secondary tabular-nums">{new Date(r.recordedAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
