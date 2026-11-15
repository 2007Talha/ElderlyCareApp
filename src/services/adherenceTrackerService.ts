/**
 * Adherence tracking service.
 * Logs dose events and computes adherence metrics.
 */
import type { AdherenceRecord, DoseStatus } from '@/types';
import type { AdherenceInput } from '@/utils/validationSchemas';
import { getAdherenceRecords, addAdherenceRecord } from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';

/** Logs a new adherence record. */
export function logAdherence(input: AdherenceInput): AdherenceRecord {
  const record: AdherenceRecord = {
    id: `adh-${generateId()}`,
    ...input,
    recordedAt: nowISO(),
  };
  return addAdherenceRecord(record);
}

/** Returns all adherence records for a specific medication. */
export function getRecordsForMedication(medId: string): AdherenceRecord[] {
  return getAdherenceRecords().filter((r) => r.medicationId === medId);
}

/** Returns adherence records within a date range. */
export function getRecordsInRange(
  startISO: string,
  endISO: string
): AdherenceRecord[] {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  return getAdherenceRecords().filter((r) => {
    const t = new Date(r.recordedAt).getTime();
    return t >= start && t <= end;
  });
}

/** Computes adherence rate as a percentage (taken / total). */
export function computeAdherenceRate(records: AdherenceRecord[]): number {
  if (records.length === 0) return 100;
  const taken = records.filter((r) => r.status === 'Taken').length;
  return Math.round((taken / records.length) * 100);
}

/** Computes daily streak of consecutive days with all doses taken. */
export function computeDailyStreak(records: AdherenceRecord[]): number {
  if (records.length === 0) return 0;
  const dayMap = groupByDay(records);
  const sortedDays = Object.keys(dayMap).sort().reverse();
  let streak = 0;
  for (const day of sortedDays) {
    const allTaken = dayMap[day].every((r) => r.status === 'Taken');
    if (allTaken) { streak++; } else { break; }
  }
  return streak;
}

/** Finds missed doses (status Missed) from adherence records. */
export function findMissedDoses(records: AdherenceRecord[]): AdherenceRecord[] {
  return records.filter((r) => r.status === 'Missed');
}

/** Groups adherence records by calendar day (YYYY-MM-DD). */
function groupByDay(
  records: AdherenceRecord[]
): Record<string, AdherenceRecord[]> {
  const map: Record<string, AdherenceRecord[]> = {};
  for (const r of records) {
    const day = r.recordedAt.slice(0, 10);
    if (!map[day]) map[day] = [];
    map[day].push(r);
  }
  return map;
}

/** Counts occurrences of each dose status in given records. */
export function countByStatus(
  records: AdherenceRecord[]
): Record<DoseStatus, number> {
  const counts: Record<DoseStatus, number> = {
    Taken: 0, Missed: 0, Snoozed: 0, Skipped: 0,
  };
  for (const r of records) { counts[r.status]++; }
  return counts;
}
