/**
 * In-memory data store pre-seeded with realistic demo data.
 * Provides deterministic local persistence without external databases.
 */
import type {
  Medication, Appointment, AdherenceRecord,
  EmailDispatchLog, ConsentPreferences,
} from '@/types';
import {
  SEED_MEDICATIONS, SEED_APPOINTMENTS, SEED_ADHERENCE,
} from './seedData';

/** Mutable medication records and O(1) index. */
const medications: Medication[] = [...SEED_MEDICATIONS];
const medMap = new Map<string, Medication>(medications.map((m) => [m.id, m]));

/** Mutable appointment records and O(1) index. */
const appointments: Appointment[] = [...SEED_APPOINTMENTS];
const aptMap = new Map<string, Appointment>(appointments.map((a) => [a.id, a]));

/** Mutable adherence log entries. */
const adherenceRecords: AdherenceRecord[] = [...SEED_ADHERENCE];

/** Email dispatch telemetry log. */
const emailLogs: EmailDispatchLog[] = [];

/** Elderly consent preferences (default: share with all). */
let consentPrefs: ConsentPreferences = {
  shareWithCaretaker: true,
  shareWithFamily: true,
  allowScheduleModifications: true,
};

/** Rate limiting tracker for passcode attempts. */
const rateLimiter: Map<string, { count: number; lockedUntil: number }> =
  new Map();

/* ── Medication Accessors ── */

/** Returns all medication records. */
export function getMedications(): Medication[] { return medications; }
/** Finds a medication by id in O(1) time. */
export function getMedicationById(id: string): Medication | undefined {
  return medMap.get(id);
}
/** Adds a medication record and returns it. */
export function addMedication(med: Medication): Medication {
  medications.push(med);
  medMap.set(med.id, med);
  return med;
}
/** Updates a medication by id. Returns the updated record or undefined. */
export function updateMedication(
  id: string, patch: Partial<Medication>
): Medication | undefined {
  const idx = medications.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  const updated = { ...medications[idx], ...patch } as Medication;
  medications[idx] = updated;
  medMap.set(id, updated);
  return updated;
}
/** Deletes a medication by id. Returns true if found. */
export function deleteMedication(id: string): boolean {
  const idx = medications.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  medications.splice(idx, 1);
  medMap.delete(id);
  return true;
}

/* ── Appointment Accessors ── */

/** Returns all appointment records. */
export function getAppointments(): Appointment[] { return appointments; }
/** Finds an appointment by id in O(1) time. */
export function getAppointmentById(id: string): Appointment | undefined {
  return aptMap.get(id);
}
/** Adds an appointment record. */
export function addAppointment(apt: Appointment): Appointment {
  appointments.push(apt);
  aptMap.set(apt.id, apt);
  return apt;
}
/** Updates an appointment by id. */
export function updateAppointment(
  id: string, patch: Partial<Appointment>
): Appointment | undefined {
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  const updated = { ...appointments[idx], ...patch } as Appointment;
  appointments[idx] = updated;
  aptMap.set(id, updated);
  return updated;
}
/** Deletes an appointment by id. */
export function deleteAppointment(id: string): boolean {
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  appointments.splice(idx, 1);
  aptMap.delete(id);
  return true;
}

/* ── Adherence Accessors ── */

/** Returns all adherence records. */
export function getAdherenceRecords(): AdherenceRecord[] {
  return adherenceRecords;
}
/** Adds an adherence record. */
export function addAdherenceRecord(rec: AdherenceRecord): AdherenceRecord {
  adherenceRecords.push(rec); return rec;
}

/* ── Email Log Accessors ── */

/** Returns all email dispatch log entries. */
export function getEmailLogs(): EmailDispatchLog[] { return emailLogs; }
/** Adds an email dispatch log entry. */
export function addEmailLog(log: EmailDispatchLog): void {
  emailLogs.push(log);
}

/* ── Consent Accessors ── */

/** Returns current consent preferences. */
export function getConsent(): ConsentPreferences { return consentPrefs; }
/** Updates consent preferences. */
export function setConsent(prefs: ConsentPreferences): void {
  consentPrefs = prefs;
}

/** Active check-in alert state. */
let activeCheckIn: { id: string; requestedAt: string; message: string; acknowledged: boolean } | null = null;

/** Returns active check-in alert. */
export function getCheckInAlert() { return activeCheckIn; }
/** Sets or clears active check-in alert. */
export function setCheckInAlert(val: { id: string; requestedAt: string; message: string; acknowledged: boolean } | null) {
  activeCheckIn = val;
}

/* ── Rate Limiter Accessors ── */

/** Returns the rate limit state for a given IP key. */
export function getRateLimit(key: string) { return rateLimiter.get(key); }
/** Sets the rate limit state for a given IP key. */
export function setRateLimit(
  key: string, val: { count: number; lockedUntil: number }
): void {
  rateLimiter.set(key, val);
}

/** Resets all in-memory data back to deterministic initial seeds. */
export function resetDataStore(): void {
  medications.splice(0, medications.length, ...SEED_MEDICATIONS);
  medMap.clear();
  SEED_MEDICATIONS.forEach((m) => medMap.set(m.id, m));
  appointments.splice(0, appointments.length, ...SEED_APPOINTMENTS);
  aptMap.clear();
  SEED_APPOINTMENTS.forEach((a) => aptMap.set(a.id, a));
  adherenceRecords.splice(0, adherenceRecords.length, ...SEED_ADHERENCE);
  emailLogs.length = 0;
  consentPrefs = { shareWithCaretaker: true, shareWithFamily: true, allowScheduleModifications: true };
  activeCheckIn = null;
  rateLimiter.clear();
}
