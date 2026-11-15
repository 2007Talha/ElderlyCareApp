/**
 * Drug interaction and refill depletion guard service.
 * Cross-checks medications for contraindications and low inventory.
 */
import type { DrugInteraction, Medication } from '@/types';
import { REMINDER_CONFIG } from '@/config/constants';
import { getMedications } from '@/store/dataStore';

/** Known drug interaction database (expandable). */
const KNOWN_INTERACTIONS: DrugInteraction[] = [
  {
    drugA: 'Warfarin', drugB: 'Aspirin',
    severity: 'High',
    description: 'Increased bleeding risk. Consult doctor immediately.',
  },
  {
    drugA: 'Metformin', drugB: 'Alcohol',
    severity: 'High',
    description: 'Risk of lactic acidosis. Avoid alcohol consumption.',
  },
  {
    drugA: 'Lisinopril', drugB: 'Potassium Supplements',
    severity: 'Moderate',
    description: 'May cause dangerously high potassium levels.',
  },
  {
    drugA: 'Warfarin', drugB: 'Ibuprofen',
    severity: 'High',
    description: 'NSAIDs increase bleeding risk with anticoagulants.',
  },
  {
    drugA: 'Omeprazole', drugB: 'Clopidogrel',
    severity: 'Moderate',
    description: 'May reduce effectiveness of Clopidogrel.',
  },
];

/** Checks a medication name against all active meds for interactions. */
export function checkInteractions(newDrugName: string): DrugInteraction[] {
  const activeMeds = getMedications().filter((m) => m.isActive);
  const activeNames = activeMeds.map((m) => m.medicationName.toLowerCase());
  const target = newDrugName.toLowerCase();

  return KNOWN_INTERACTIONS.filter((i) => {
    const a = i.drugA.toLowerCase();
    const b = i.drugB.toLowerCase();
    return (
      (a === target && activeNames.includes(b)) ||
      (b === target && activeNames.includes(a))
    );
  });
}

/** Returns medications with inventory below the refill threshold. */
export function checkLowInventory(): Medication[] {
  const threshold = REMINDER_CONFIG.LOW_INVENTORY_THRESHOLD;
  return getMedications().filter(
    (m) => m.isActive && m.inventoryCount <= threshold
  );
}

/** Estimates days until depletion based on frequency count. */
export function estimateDaysUntilDepletion(med: Medication): number {
  const dosesPerDay = med.scheduledTimes.length;
  if (dosesPerDay === 0) return Infinity;
  return Math.floor(med.inventoryCount / dosesPerDay);
}
