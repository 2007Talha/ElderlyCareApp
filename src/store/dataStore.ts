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

/** Mutable medication records. */
const medications: Medication[] = [...SEED_MEDICATIONS];

/** Mutable appointment records. */
const appointments: Appointment[] = [...SEED_APPOINTMENTS];

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
/** Finds a medication by id. */
export function getMedicationById(id: string): Medication | undefined {
  return medications.find((m) => m.id === id);
}
/** Adds a medication record and returns it. */
export function addMedication(med: Medication): Medication {
  medications.push(med); return med;
}
/** Updates a medication by id. Returns the updated record or undefined. */
export function updateMedication(
  id: string, patch: Partial<Medication>
): Medication | undefined {
  const idx = medications.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  medications[idx] = { ...medications[idx], ...patch } as Medication;
  return medications[idx];
}
/** Deletes a medication by id. Returns true if found. */
export function deleteMedication(id: string): boolean {
  const idx = medications.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  medications.splice(idx, 1); return true;
}

/* ── Appointment Accessors ── */

/** Returns all appointment records. */
export function getAppointments(): Appointment[] { return appointments; }
/** Finds an appointment by id. */
export function getAppointmentById(id: string): Appointment | undefined {
  return appointments.find((a) => a.id === id);
}
/** Adds an appointment record. */
export function addAppointment(apt: Appointment): Appointment {
  appointments.push(apt); return apt;
}
/** Updates an appointment by id. */
export function updateAppointment(
  id: string, patch: Partial<Appointment>
): Appointment | undefined {
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  appointments[idx] = { ...appointments[idx], ...patch } as Appointment;
  return appointments[idx];
}
/** Deletes an appointment by id. */
export function deleteAppointment(id: string): boolean {
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  appointments.splice(idx, 1); return true;
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
