/**
 * Medication Adherence Tracking Service.
 * Problem Statement Requirement: "Track adherence and monitor upcoming doctor appointments"
 * with compliance percentages, consecutive daily streaks, and status distributions.
 */
import type { AdherenceRecord, DoseStatus } from '@/types';
import type { AdherenceInput } from '@/utils/validationSchemas';
import { getAdherenceRecords, addAdherenceRecord } from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';

/**
 * Logs a new adherence record with a timestamp and audit trail.
 * @param input Validated adherence dose log.
 * @returns Saved AdherenceRecord.
 */
export function logAdherence(input: AdherenceInput): AdherenceRecord {
  const record: AdherenceRecord = {
    id: `adh-${generateId()}`,
    ...input,
    recordedAt: nowISO(),
  };
  return addAdherenceRecord(record);
}

/**
 * Returns all adherence records for a specific medication.
 * @param medId Unique medication identifier.
 * @returns Array of matching AdherenceRecords.
 */
export function getRecordsForMedication(medId: string): AdherenceRecord[] {
  return getAdherenceRecords().filter((r) => r.medicationId === medId);
}

/**
 * Returns adherence records within a date range.
 * @param startISO Start ISO date string.
 * @param endISO End ISO date string.
 * @returns Array of AdherenceRecords within range.
 */
export function getRecordsInRange(startISO: string, endISO: string): AdherenceRecord[] {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  return getAdherenceRecords().filter((r) => {
    const t = new Date(r.recordedAt).getTime();
    return t >= start && t <= end;
  });
}

/**
 * Computes adherence rate as a percentage (taken / total).
 * @param records Array of adherence logs.
 * @returns Integer adherence percentage (0-100).
 */
export function computeAdherenceRate(records: AdherenceRecord[]): number {
  if (records.length === 0) return 100;
  const taken = records.filter((r) => r.status === 'Taken').length;
  return Math.round((taken / records.length) * 100);
}

/**
 * Computes daily streak of consecutive days with all doses taken.
 * @param records Array of adherence logs.
 * @returns Number of consecutive days.
 */
export function computeDailyStreak(records: AdherenceRecord[]): number {
  if (records.length === 0) return 0;
  const dayMap = groupByDay(records);
  const sortedDays = Object.keys(dayMap).sort().reverse();
  let streak = 0;
  for (const day of sortedDays) {
    if (dayMap[day].every((r) => r.status === 'Taken')) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Finds missed doses from adherence records.
 * @param records Array of adherence logs.
 * @returns Array of missed dose records.
 */
export function findMissedDoses(records: AdherenceRecord[]): AdherenceRecord[] {
  return records.filter((r) => r.status === 'Missed');
}

/** Groups adherence records by calendar day (YYYY-MM-DD). */
function groupByDay(records: AdherenceRecord[]): Record<string, AdherenceRecord[]> {
  const map: Record<string, AdherenceRecord[]> = {};
  for (const r of records) {
    const day = r.recordedAt.slice(0, 10);
    if (!map[day]) map[day] = [];
    map[day].push(r);
  }
  return map;
}

/**
 * Counts occurrences of each dose status in given records.
 * @param records Array of adherence logs.
 * @returns Record mapping each DoseStatus to its count.
 */
export function countByStatus(records: AdherenceRecord[]): Record<DoseStatus, number> {
  const counts: Record<DoseStatus, number> = {
    Taken: 0, Missed: 0, Snoozed: 0, Skipped: 0,
  };
  for (const r of records) {
    counts[r.status]++;
  }
  return counts;
}
