'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Medication, Appointment, ApiResponse, DoseStatus } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { Heart, Pill, Calendar, Activity, AlertTriangle } from 'lucide-react';

interface AdherenceData {
  records: { id: string; medicationId: string; status: DoseStatus }[];
  rate: number;
  streak: number;
  breakdown: Record<DoseStatus, number>;
}

/** Dashboard overview with key health metrics and quick status. */
export default function Dashboard() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [adherence, setAdherence] = useState<AdherenceData | null>(null);
  const [lowInventory, setLowInventory] = useState<Medication[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const [medRes, aptRes, adhRes] = await Promise.all([
        fetch('/api/medications'),
        fetch('/api/appointments'),
        fetch('/api/adherence'),
      ]);
      const medData: ApiResponse<{ medications: Medication[]; lowInventory: Medication[] }> = await medRes.json();
      const aptData: ApiResponse<Appointment[]> = await aptRes.json();
      const adhData: ApiResponse<AdherenceData> = await adhRes.json();

      if (medData.success && medData.data) {
        setMedications(medData.data.medications);
        setLowInventory(medData.data.lowInventory);
      }
      if (aptData.success && aptData.data) setAppointments(aptData.data);
      if (adhData.success && adhData.data) setAdherence(adhData.data);
    } catch { /* graceful offline fallback */ }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeMeds = medications.filter((m) => m.isActive);
  const upcomingApts = appointments.filter(
    (a) => new Date(a.appointmentDateTime).getTime() > Date.now()
  );

  return (
    <section aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading" className="text-xl font-bold flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-accent" aria-hidden="true" />
        Health Dashboard
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
          <Pill className="w-8 h-8 text-accent mx-auto mb-2" aria-hidden="true" />
          <p className="text-2xl font-bold">{activeMeds.length}</p>
          <p className="text-sm text-gray-400">Active Medications</p>
        </div>
        <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
          <Activity className="w-8 h-8 text-success mx-auto mb-2" aria-hidden="true" />
          <p className="text-2xl font-bold text-success">{adherence?.rate ?? 0}%</p>
          <p className="text-sm text-gray-400">Adherence Rate</p>
        </div>
        <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
          <Calendar className="w-8 h-8 text-warning mx-auto mb-2" aria-hidden="true" />
          <p className="text-2xl font-bold">{upcomingApts.length}</p>
          <p className="text-sm text-gray-400">Upcoming Appointments</p>
        </div>
        <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
          <Heart className="w-8 h-8 text-accent mx-auto mb-2" aria-hidden="true" />
          <p className="text-2xl font-bold">{adherence?.streak ?? 0}</p>
          <p className="text-sm text-gray-400">Day Streak</p>
        </div>
      </div>

      {lowInventory.length > 0 && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl" role="alert">
          <h3 className="flex items-center gap-2 text-warning font-medium mb-2">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            Low Inventory Alerts
          </h3>
          {lowInventory.map((m) => (
            <p key={m.id} className="text-sm text-gray-300">
              {m.medicationName}: {m.inventoryCount} pills remaining
            </p>
          ))}
        </div>
      )}

      {upcomingApts.length > 0 && (
        <div className="bg-surface border border-gray-800 rounded-xl p-4">
          <h3 className="font-medium mb-3">Next Appointments</h3>
          {upcomingApts.slice(0, 3).map((apt) => (
            <div key={apt.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div>
                <p className="text-sm font-medium">{apt.doctorName}</p>
                <p className="text-xs text-gray-400">{apt.specialty} — {apt.location}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-300">{new Date(apt.appointmentDateTime).toLocaleDateString()}</p>
                <StatusBadge status={apt.reminderStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
