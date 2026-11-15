/**
 * Local state persistence layer for serverless execution environments.
 * Hydrates and synchronizes client-side state across browser refreshes on Vercel/Netlify.
 */

export const STORAGE_KEYS = {
  SESSION: 'eldercare_session',
  COMFORT_MODE: 'eldercare_comfort_mode',
  ACTIVITIES: 'eldercare_activities',
  PROPOSALS: 'eldercare_proposals',
  LAST_DISPATCHED_EMAIL: 'eldercare_last_email',
} as const;

/** Safely reads structured JSON from browser localStorage. */
export function loadLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Safely writes structured JSON to browser localStorage. */
export function saveLocalData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage quota gracefully handled */ }
}

/** Clears all application keys from localStorage to reset demo data. */
export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch { /* fallback */ }
}
