/**
 * Tests for adherence tracking, calculation, and missed-dose detection.
 */
import { describe, it, expect } from 'vitest';
import {
  logAdherence, computeAdherenceRate, computeDailyStreak,
  findMissedDoses, countByStatus,
} from '@/services/adherenceTrackerService';
import { getAdherenceRecords } from '@/store/dataStore';
import type { AdherenceRecord } from '@/types';

describe('adherenceTrackerService', () => {
  it('logs a new adherence record', () => {
    const record = logAdherence({
      medicationId: 'med-001',
      status: 'Taken',
      scheduledTime: '2026-11-15T08:00:00Z',
      recordedBy: 'Elderly Individual',
      notes: 'Test log',
    });
    expect(record.id).toBeTruthy();
    expect(record.status).toBe('Taken');
    expect(record.medicationId).toBe('med-001');
  });

  it('computes 100% adherence when all doses are taken', () => {
    const records: AdherenceRecord[] = [
      { id: '1', medicationId: 'm1', status: 'Taken', scheduledTime: '', recordedAt: '2026-11-14T08:00:00Z', recordedBy: 'Elderly Individual', notes: '' },
      { id: '2', medicationId: 'm1', status: 'Taken', scheduledTime: '', recordedAt: '2026-11-14T20:00:00Z', recordedBy: 'Elderly Individual', notes: '' },
    ];
    expect(computeAdherenceRate(records)).toBe(100);
  });

  it('computes 50% adherence with half missed', () => {
    const records: AdherenceRecord[] = [
      { id: '1', medicationId: 'm1', status: 'Taken', scheduledTime: '', recordedAt: '2026-11-14T08:00:00Z', recordedBy: 'Elderly Individual', notes: '' },
      { id: '2', medicationId: 'm1', status: 'Missed', scheduledTime: '', recordedAt: '2026-11-14T20:00:00Z', recordedBy: 'Elderly Individual', notes: '' },
    ];
    expect(computeAdherenceRate(records)).toBe(50);
  });

  it('returns 100% for empty records', () => {
    expect(computeAdherenceRate([])).toBe(100);
  });

  it('computes daily streak correctly', () => {
    const records: AdherenceRecord[] = [
      { id: '1', medicationId: 'm1', status: 'Taken', scheduledTime: '', recordedAt: '2026-11-14T08:00:00Z', recordedBy: 'Elderly Individual', notes: '' },
      { id: '2', medicationId: 'm1', status: 'Taken', scheduledTime: '', recordedAt: '2026-11-13T08:00:00Z', recordedBy: 'Elderly Individual', notes: '' },
    ];
    expect(computeDailyStreak(records)).toBe(2);
  });

  it('breaks streak on a missed day', () => {
    const records: AdherenceRecord[] = [
      { id: '1', medicationId: 'm1', status: 'Taken', scheduledTime: '', recordedAt: '2026-11-14T08:00:00Z', recordedBy: 'Elderly Individual', notes: '' },
      { id: '2', medicationId: 'm1', status: 'Missed', scheduledTime: '', recordedAt: '2026-11-13T08:00:00Z', recordedBy: 'Elderly Individual', notes: '' },
    ];
    expect(computeDailyStreak(records)).toBe(1);
  });

  it('finds missed doses', () => {
    const records: AdherenceRecord[] = [
      { id: '1', medicationId: 'm1', status: 'Taken', scheduledTime: '', recordedAt: '', recordedBy: 'Elderly Individual', notes: '' },
      { id: '2', medicationId: 'm2', status: 'Missed', scheduledTime: '', recordedAt: '', recordedBy: 'Caretaker', notes: '' },
    ];
    const missed = findMissedDoses(records);
    expect(missed).toHaveLength(1);
    expect(missed[0].medicationId).toBe('m2');
  });

  it('counts by status correctly', () => {
    const records: AdherenceRecord[] = [
      { id: '1', medicationId: 'm1', status: 'Taken', scheduledTime: '', recordedAt: '', recordedBy: 'Elderly Individual', notes: '' },
      { id: '2', medicationId: 'm1', status: 'Missed', scheduledTime: '', recordedAt: '', recordedBy: 'Elderly Individual', notes: '' },
      { id: '3', medicationId: 'm1', status: 'Snoozed', scheduledTime: '', recordedAt: '', recordedBy: 'Elderly Individual', notes: '' },
    ];
    const counts = countByStatus(records);
    expect(counts.Taken).toBe(1);
    expect(counts.Missed).toBe(1);
    expect(counts.Snoozed).toBe(1);
    expect(counts.Skipped).toBe(0);
  });
});
