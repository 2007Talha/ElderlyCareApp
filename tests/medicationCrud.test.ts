/**
 * Tests for medication CRUD service and Zod validation edge cases.
 */
import { describe, it, expect } from 'vitest';
import {
  listMedications, findMedication, createMedication,
  editMedication, removeMedication, decrementInventory,
} from '@/services/medicationScheduleService';
import { medicationSchema } from '@/utils/validationSchemas';

describe('medicationScheduleService', () => {
  it('lists pre-seeded medications', () => {
    const meds = listMedications();
    expect(meds.length).toBeGreaterThanOrEqual(4);
  });

  it('finds a medication by id', () => {
    const med = findMedication('med-001');
    expect(med).toBeTruthy();
    expect(med?.medicationName).toBe('Metformin');
  });

  it('returns undefined for a non-existent id', () => {
    expect(findMedication('nonexistent')).toBeUndefined();
  });

  it('creates a new medication', () => {
    const input = {
      medicationName: 'TestMed',
      dosage: '100mg',
      frequency: 'Once daily',
      scheduledTimes: ['10:00'],
      inventoryCount: 20,
      instructions: 'Test instructions',
      prescribedBy: 'Dr. Test',
      isActive: true,
    };
    const med = createMedication(input);
    expect(med.id).toBeTruthy();
    expect(med.medicationName).toBe('TestMed');
  });

  it('edits an existing medication', () => {
    const updated = editMedication('med-001', { dosage: '750mg' });
    expect(updated?.dosage).toBe('750mg');
  });

  it('returns undefined when editing a non-existent medication', () => {
    expect(editMedication('nonexistent', { dosage: '1mg' })).toBeUndefined();
  });

  it('decrements inventory on dose taken', () => {
    const before = findMedication('med-002');
    const prevCount = before?.inventoryCount ?? 0;
    const updated = decrementInventory('med-002');
    expect(updated?.inventoryCount).toBe(prevCount - 1);
  });
});

describe('medicationSchema validation', () => {
  it('rejects missing medication name', () => {
    const result = medicationSchema.safeParse({
      dosage: '10mg', frequency: 'daily',
      scheduledTimes: ['08:00'], inventoryCount: 10,
      prescribedBy: 'Dr. X',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative inventory count', () => {
    const result = medicationSchema.safeParse({
      medicationName: 'Test', dosage: '10mg', frequency: 'daily',
      scheduledTimes: ['08:00'], inventoryCount: -5,
      prescribedBy: 'Dr. X',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty scheduled times array', () => {
    const result = medicationSchema.safeParse({
      medicationName: 'Test', dosage: '10mg', frequency: 'daily',
      scheduledTimes: [], inventoryCount: 10,
      prescribedBy: 'Dr. X',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid medication payload', () => {
    const result = medicationSchema.safeParse({
      medicationName: 'Valid', dosage: '50mg', frequency: 'Twice daily',
      scheduledTimes: ['08:00', '20:00'], inventoryCount: 30,
      prescribedBy: 'Dr. Valid',
    });
    expect(result.success).toBe(true);
  });
});
