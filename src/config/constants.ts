/**
 * Centralized configuration constants.
 * All thresholds, timeouts, prompts, and rules live here — zero magic values.
 */

/** Passcode authentication rules. */
export const AUTH_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 300_000,
  SESSION_TTL_MS: 3_600_000,
  PASSCODE_LENGTH: 6,
} as const;

/** AI / Gemini configuration. */
export const AI_CONFIG = {
  MODEL_NAME: 'gemini-1.5-flash',
  MAX_TOKENS: 1024,
  TIMEOUT_MS: 8_000,
  SYSTEM_PROMPT: `You are a compassionate healthcare assistant for elderly individuals.
Provide clear, simple, and actionable advice about medications, appointments,
and daily health routines. Always prioritize safety and suggest consulting
a doctor for medical decisions.`,
  SCAN_PROMPT: `Extract medication details from this prescription label image.
Return ONLY valid JSON: {"medicationName":"...","dosage":"...","frequency":"...","instructions":"...","prescribedBy":"..."}`,
} as const;

/** Email reminder timing thresholds. */
export const REMINDER_CONFIG = {
  UPCOMING_DOSE_WINDOW_MS: 1_800_000,
  APPOINTMENT_24H_MS: 86_400_000,
  APPOINTMENT_2H_MS: 7_200_000,
  LOW_INVENTORY_THRESHOLD: 7,
} as const;

/** UI configuration. */
export const UI_CONFIG = {
  DEBOUNCE_MS: 300,
  COMFORT_FONT_SIZE: '20px',
  COMFORT_TOUCH_TARGET: '56px',
  DEFAULT_BG: '#0B0F19',
  SURFACE_BG: '#111827',
} as const;

/** Valid user roles. */
export const VALID_ROLES = [
  'Elderly Individual',
  'Caretaker',
  'Family Member',
] as const;

/** Dose status options. */
export const DOSE_STATUSES = [
  'Taken',
  'Missed',
  'Snoozed',
  'Skipped',
] as const;

/** Quick voice command chips for elderly users. */
export const VOICE_COMMANDS = [
  'I took my morning pill',
  'Read my next appointment',
  'Need family check-in',
  'Show my medications',
  'What did I miss today',
] as const;
