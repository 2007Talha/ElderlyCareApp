'use client';

import { useState, useCallback } from 'react';
import type { Medication } from '@/types';
import { AlertCircle, PackagePlus, PhoneCall, Check } from 'lucide-react';

interface CaretakerOversightProps {
  readonly lowInventory: Medication[];
  readonly missedDoseCount: number;
}

/** Clinical oversight & escalation panel for Caretaker persona. */
export default function CaretakerOversight({
  lowInventory, missedDoseCount,
}: CaretakerOversightProps) {
  const [reorderedId, setReorderedId] = useState<string | null>(null);
  const [called, setCalled] = useState(false);

  const handleReorder = useCallback((medId: string) => {
    setReorderedId(medId);
    setTimeout(() => setReorderedId(null), 3000);
  }, []);

  const handleEmergencyCall = useCallback(() => {
    setCalled(true);
    setTimeout(() => setCalled(false), 3000);
  }, []);

  return (
    <div className="bg-surface border border-warning/30 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            Caretaker Clinical Oversight
          </h3>
          <p className="text-xs text-gray-400">Monitoring patient vitals, adherence & supply levels</p>
        </div>
        <button
          onClick={handleEmergencyCall}
          className="flex items-center gap-1.5 text-xs bg-danger/20 hover:bg-danger/30 text-danger border border-danger/40 px-3 py-1.5 rounded-lg transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          {called ? 'Check-in Triggered!' : 'Trigger Care Check-in'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700/80">
          <p className="text-xs text-gray-400 font-medium mb-1">Adherence Status</p>
          <p className="text-sm text-gray-200">
            {missedDoseCount > 0
              ? `⚠️ ${missedDoseCount} dose(s) missed recently. Escalation alert dispatched.`
              : '✅ No missed doses recorded in current 24-hour cycle.'}
          </p>
        </div>

        <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700/80">
          <p className="text-xs text-gray-400 font-medium mb-1">Refill Procurement</p>
          {lowInventory.length === 0 ? (
            <p className="text-xs text-gray-400">All supplies are currently above safety threshold.</p>
          ) : (
            lowInventory.map((med) => (
              <div key={med.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-warning font-medium">{med.medicationName} ({med.inventoryCount} left)</span>
                <button
                  onClick={() => handleReorder(med.id)}
                  className="flex items-center gap-1 text-accent hover:underline"
                >
                  {reorderedId === med.id ? <Check className="w-3 h-3 text-success" /> : <PackagePlus className="w-3 h-3" />}
                  {reorderedId === med.id ? 'Requested' : 'Reorder'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
