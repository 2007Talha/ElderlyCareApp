'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdherenceRecord, Medication, ApiResponse, DoseStatus } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { Activity, CheckCircle, XCircle, Clock, SkipForward } from 'lucide-react';
import { DOSE_STATUSES } from '@/config/constants';

interface AdherenceData {
  records: AdherenceRecord[];
  rate: number;
  streak: number;
  breakdown: Record<DoseStatus, number>;
}

/** Adherence tracking panel with metrics and dose logging. */
export default function AdherenceTracker() {
  const [data, setData] = useState<AdherenceData | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DoseStatus>('Taken');
  const [selectedTime, setSelectedTime] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [adhRes, medRes] = await Promise.all([
        fetch('/api/adherence'), fetch('/api/medications'),
      ]);
      const adhData: ApiResponse<AdherenceData> = await adhRes.json();
      const medData: ApiResponse<{ medications: Medication[] }> = await medRes.json();
      if (adhData.success && adhData.data) setData(adhData.data);
      if (medData.success && medData.data) setMedications(medData.data.medications);
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLog = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed || !selectedTime) return;
    try {
      await fetch('/api/adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: selectedMed, status: selectedStatus,
          scheduledTime: selectedTime,
          recordedBy: 'Elderly Individual', notes: '',
        }),
      });
      await fetchData();
      setSelectedMed(''); setSelectedTime('');
    } catch { /* fallback */ }
  }, [selectedMed, selectedStatus, selectedTime, fetchData]);

  const statusIcons: Record<string, React.ReactNode> = {
    Taken: <CheckCircle className="w-4 h-4 text-success" />,
    Missed: <XCircle className="w-4 h-4 text-danger" />,
    Snoozed: <Clock className="w-4 h-4 text-warning" />,
    Skipped: <SkipForward className="w-4 h-4 text-gray-400" />,
  };

  return (
    <section aria-labelledby="adherence-heading">
      <h2 id="adherence-heading" className="text-xl font-bold flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-accent" aria-hidden="true" />
        Medication Adherence
      </h2>

      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6" aria-live="polite">
          <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-success">{data.rate}%</p>
            <p className="text-sm text-gray-400">Adherence Rate</p>
          </div>
          <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-accent">{data.streak}</p>
            <p className="text-sm text-gray-400">Day Streak</p>
          </div>
          <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-warning">{data.breakdown.Missed}</p>
            <p className="text-sm text-gray-400">Missed Doses</p>
          </div>
        </div>
      )}

      <form onSubmit={handleLog} className="bg-surface border border-gray-800 rounded-xl p-4 mb-6">
        <h3 className="font-medium mb-3">Log Dose</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="adh-med" className="block text-xs text-gray-400 mb-1">Medication</label>
            <select id="adh-med" value={selectedMed} onChange={(e) => setSelectedMed(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" required>
              <option value="">Select...</option>
              {medications.filter((m) => m.isActive).map((m) => (
                <option key={m.id} value={m.id}>{m.medicationName}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="adh-status" className="block text-xs text-gray-400 mb-1">Status</label>
            <select id="adh-status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as DoseStatus)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
              {DOSE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="adh-time" className="block text-xs text-gray-400 mb-1">Scheduled Time</label>
            <input id="adh-time" type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" required />
          </div>
        </div>
        <button type="submit" className="mt-3 bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Log Dose</button>
      </form>

      <div className="space-y-2" aria-live="polite">
        <h3 className="font-medium text-gray-300 mb-2">Recent History</h3>
        {data?.records.slice(-10).reverse().map((r) => (
          <div key={r.id} className="flex items-center justify-between bg-surface border border-gray-800 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              {statusIcons[r.status]}
              <span className="text-sm">{medications.find((m) => m.id === r.medicationId)?.medicationName ?? r.medicationId}</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={r.status} />
              <span className="text-xs text-gray-500">{new Date(r.recordedAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
