/**
 * Medication Schedule Management Service.
 * Problem Statement Requirement: "View, add, edit, and manage medication schedules"
 * with dosage, frequency, inventory tracking, and prescribed physician context.
 */
import type { Medication } from '@/types';
import type { MedicationInput } from '@/utils/validationSchemas';
import {
  getMedications, getMedicationById,
  addMedication, updateMedication, deleteMedication,
} from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';

/**
 * Returns all medication records, optionally filtered by active status.
 * @param activeOnly Optional filter for active medications only.
 * @returns Array of Medication records.
 */
export function listMedications(activeOnly?: boolean): Medication[] {
  const all = getMedications();
  if (activeOnly === undefined) return all;
  return all.filter((m) => m.isActive === activeOnly);
}

/**
 * Finds a single medication by its id in O(1) time.
 * @param id Unique medication identifier.
 * @returns Medication record or undefined if not found.
 */
export function findMedication(id: string): Medication | undefined {
  return getMedicationById(id);
}

/**
 * Creates a new medication record from validated input.
 * @param input Validated medication payload.
 * @returns Newly created Medication record.
 */
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

/**
 * Updates an existing medication by id with partial data.
 * @param id Unique medication identifier.
 * @param input Partial validated fields to update.
 * @returns Updated Medication record or undefined.
 */
export function editMedication(
  id: string, input: Partial<MedicationInput>
): Medication | undefined {
  return updateMedication(id, { ...input, updatedAt: nowISO() });
}

/**
 * Removes a medication record by id.
 * @param id Unique medication identifier.
 * @returns True if medication was found and deleted.
 */
export function removeMedication(id: string): boolean {
  return deleteMedication(id);
}

/**
 * Decrements inventory for a medication after a dose is taken.
 * @param id Unique medication identifier.
 * @returns Updated Medication record or undefined.
 */
export function decrementInventory(id: string): Medication | undefined {
  const med = getMedicationById(id);
  if (!med || med.inventoryCount <= 0) return undefined;
  return updateMedication(id, {
    inventoryCount: med.inventoryCount - 1,
    updatedAt: nowISO(),
  });
}
