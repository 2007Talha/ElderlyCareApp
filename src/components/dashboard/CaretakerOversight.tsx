'use client';

import { useState, useCallback } from 'react';
import type { Medication } from '@/types';
import { AlertCircle, PackagePlus, PhoneCall, Check } from 'lucide-react';

interface CaretakerOversightProps {
  readonly lowInventory: Medication[];
  readonly missedDoseCount: number;
  readonly onRefresh?: () => void;
}

/** Clinical oversight & escalation panel for Caretaker persona. */
export default function CaretakerOversight({
  lowInventory, missedDoseCount, onRefresh,
}: CaretakerOversightProps) {
  const [reorderedId, setReorderedId] = useState<string | null>(null);
  const [called, setCalled] = useState(false);

  const handleReorder = useCallback(async (medId: string) => {
    setReorderedId(medId);
    try {
      const med = lowInventory.find((m) => m.id === medId);
      const newCount = (med?.inventoryCount ?? 5) + 30;
      await fetch(`/api/medications/${medId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryCount: newCount }),
      });
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Refill confirmed: 30 pills added for ${med?.medicationName || 'medication'}.`,
          requestedBy: 'Caretaker',
        }),
      });
      onRefresh?.();
    } catch { /* fallback */ }
    finally {
      setTimeout(() => setReorderedId(null), 3000);
    }
  }, [lowInventory, onRefresh]);

  const handleEmergencyCall = useCallback(async () => {
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Urgent wellness check requested by Caretaker.' }),
      });
      setCalled(true);
      setTimeout(() => setCalled(false), 4000);
    } catch { /* fallback */ }
  }, []);

  return (
    <div className="bg-surface border border-amber-500/30 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Caretaker Clinical Oversight
          </h3>
          <p className="text-xs text-text-secondary">Monitoring patient vitals, adherence & supply levels</p>
        </div>
        <button
          onClick={handleEmergencyCall}
          className="flex items-center gap-1.5 text-xs bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          {called ? 'Check-in Triggered!' : 'Trigger Care Check-in'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card-subtle rounded-lg p-3 border border-border-color">
          <p className="text-xs text-text-secondary font-medium mb-1">Adherence Status</p>
          <p className="text-sm text-text-primary">
            {missedDoseCount > 0
              ? `⚠️ ${missedDoseCount} dose(s) missed recently. Escalation alert dispatched.`
              : '✅ No missed doses recorded in current 24-hour cycle.'}
          </p>
        </div>

        <div className="bg-card-subtle rounded-lg p-3 border border-border-color">
          <p className="text-xs text-text-secondary font-medium mb-1">Refill Procurement</p>
          {lowInventory.length === 0 ? (
            <p className="text-xs text-text-secondary">All supplies are currently above safety threshold.</p>
          ) : (
            lowInventory.map((med) => (
              <div key={med.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-amber-500 font-medium">{med.medicationName} ({med.inventoryCount} left)</span>
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
