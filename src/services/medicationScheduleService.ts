/**
 * Medication schedule management service.
 * Provides full CRUD operations with inventory tracking.
 */
import type { Medication } from '@/types';
import type { MedicationInput } from '@/utils/validationSchemas';
import {
  getMedications, getMedicationById,
  addMedication, updateMedication, deleteMedication,
} from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';

/** Returns all medication records, optionally filtered by active status. */
export function listMedications(activeOnly?: boolean): Medication[] {
  const all = getMedications();
  if (activeOnly === undefined) return all;
  return all.filter((m) => m.isActive === activeOnly);
}

/** Finds a single medication by its id. */
export function findMedication(id: string): Medication | undefined {
  return getMedicationById(id);
}

/** Creates a new medication record from validated input. */
export function createMedication(input: MedicationInput): Medication {
  const now = nowISO();
  const med: Medication = {
    id: `med-${generateId()}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  return addMedication(med);
}

/** Updates an existing medication by id with partial data. */
export function editMedication(
  id: string,
  input: Partial<MedicationInput>
): Medication | undefined {
  return updateMedication(id, { ...input, updatedAt: nowISO() });
}

/** Removes a medication record by id. */
export function removeMedication(id: string): boolean {
  return deleteMedication(id);
}

/** Decrements inventory for a medication after a dose is taken. */
export function decrementInventory(id: string): Medication | undefined {
  const med = getMedicationById(id);
  if (!med || med.inventoryCount <= 0) return undefined;
  return updateMedication(id, {
    inventoryCount: med.inventoryCount - 1,
    updatedAt: nowISO(),
  });
}
