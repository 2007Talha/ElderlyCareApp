/**
 * Passcode-based authentication service.
 * Problem Statement Requirement: "Secure, passcode-based access" within a
 * "shared ecosystem for elderly individuals, caretakers, and family members".
 * Supports role selection, brute-force rate limiting, and session tokens.
 */
import type { AuthSession, UserRole } from '@/types';
import { AUTH_CONFIG } from '@/config/constants';
import { getRateLimit, setRateLimit } from '@/store/dataStore';
import { generateId } from '@/utils/helpers';

const sessions: Map<string, AuthSession> = new Map();

/**
 * Checks if the given IP key is currently rate-limited.
 * @param ipKey Client identification IP or session string.
 * @returns Boolean indicating whether requests are locked.
 */
export function isRateLimited(ipKey: string): boolean {
  const entry = getRateLimit(ipKey);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  if (entry.lockedUntil > 0) {
    setRateLimit(ipKey, { count: 0, lockedUntil: 0 });
  }
  return false;
}

/**
 * Records a failed login attempt and triggers lockout if threshold reached.
 * @param ipKey Client identification IP or session string.
 */
export function recordFailedAttempt(ipKey: string): void {
  const entry = getRateLimit(ipKey) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= AUTH_CONFIG.MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + AUTH_CONFIG.LOCKOUT_DURATION_MS;
  }
  setRateLimit(ipKey, entry);
}

/**
 * Validates the passcode against the configured secret.
 * @param passcode 6-digit numeric passcode.
 * @returns Boolean indicating whether authentication succeeded.
 */
export function validatePasscode(passcode: string): boolean {
  const expected = process.env.AUTH_PASSCODE ?? '123456';
  return passcode === expected;
}

/**
 * Creates and stores a new authenticated session.
 * @param role Authenticated persona role.
 * @returns Newly minted AuthSession.
 */
export function createSession(role: UserRole): AuthSession {
  const now = Date.now();
  const session: AuthSession = {
    token: generateId() + generateId(),
    role,
    authenticatedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + AUTH_CONFIG.SESSION_TTL_MS).toISOString(),
  };
  sessions.set(session.token, session);
  return session;
}

/**
 * Validates a session token and returns the session if valid.
 * @param token Session token string.
 * @returns Valid AuthSession or null if expired/missing.
 */
export function validateSession(token: string): AuthSession | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

/**
 * Clears a session by token (logout).
 * @param token Session token string.
 */
export function clearSession(token: string): void {
  sessions.delete(token);
}

/**
 * Resets rate limit state for a key (used in testing).
 * @param ipKey Client identification IP or session string.
 */
export function resetRateLimit(ipKey: string): void {
  setRateLimit(ipKey, { count: 0, lockedUntil: 0 });
}
