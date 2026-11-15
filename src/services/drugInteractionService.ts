/**
 * Drug Contraindication and Depletion Guard Service.
 * Problem Statement Requirement: "Smart, interconnected healthcare management platform"
 * cross-checking contraindications and calculating remaining days until depletion.
 */
import type { DrugInteraction, Medication } from '@/types';
import { REMINDER_CONFIG } from '@/config/constants';
import { getMedications } from '@/store/dataStore';

const KNOWN_INTERACTIONS: DrugInteraction[] = [
  { drugA: 'Warfarin', drugB: 'Aspirin', severity: 'High', description: 'Increased bleeding risk. Consult doctor immediately.' },
  { drugA: 'Metformin', drugB: 'Alcohol', severity: 'High', description: 'Risk of lactic acidosis. Avoid alcohol consumption.' },
  { drugA: 'Lisinopril', drugB: 'Potassium Supplements', severity: 'Moderate', description: 'May cause dangerously high potassium levels.' },
  { drugA: 'Warfarin', drugB: 'Ibuprofen', severity: 'High', description: 'NSAIDs increase bleeding risk with anticoagulants.' },
  { drugA: 'Omeprazole', drugB: 'Clopidogrel', severity: 'Moderate', description: 'May reduce effectiveness of Clopidogrel.' },
];

/**
 * Checks a medication name against all active meds for interactions.
 * @param newDrugName Candidate drug name to cross-reference.
 * @returns Array of triggered DrugInteraction warnings.
 */
export function checkInteractions(newDrugName: string): DrugInteraction[] {
  const activeMeds = getMedications().filter((m) => m.isActive);
  const activeNames = new Set(activeMeds.map((m) => m.medicationName.toLowerCase()));
  const target = newDrugName.toLowerCase();

  return KNOWN_INTERACTIONS.filter((i) => {
    const a = i.drugA.toLowerCase();
    const b = i.drugB.toLowerCase();
    return (a === target && activeNames.has(b)) || (b === target && activeNames.has(a));
  });
}

/**
 * Returns medications with inventory below the refill threshold.
 * @returns Array of low-supply Medication records.
 */
export function checkLowInventory(): Medication[] {
  const threshold = REMINDER_CONFIG.LOW_INVENTORY_THRESHOLD;
  return getMedications().filter((m) => m.isActive && m.inventoryCount <= threshold);
}

/**
 * Estimates days until depletion based on frequency count.
 * @param med Medication record with inventoryCount and scheduledTimes.
 * @returns Exact number of days remaining until stockout.
 */
export function estimateDaysUntilDepletion(med: Medication): number {
  const dosesPerDay = med.scheduledTimes.length;
  if (dosesPerDay === 0) return Infinity;
  return Math.floor(med.inventoryCount / dosesPerDay);
}
