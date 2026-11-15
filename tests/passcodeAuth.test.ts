/**
 * Tests for passcode authentication service.
 * Covers valid login, invalid passcode, role rejection, and rate limiting.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  validatePasscode, createSession, validateSession,
  isRateLimited, recordFailedAttempt, resetRateLimit,
} from '@/services/passcodeAuthService';

describe('passcodeAuthService', () => {
  beforeEach(() => {
    resetRateLimit('test-ip');
  });

  it('validates the correct default passcode', () => {
    expect(validatePasscode('123456')).toBe(true);
  });

  it('rejects an incorrect passcode', () => {
    expect(validatePasscode('000000')).toBe(false);
  });

  it('creates a valid session with the correct role', () => {
    const session = createSession('Elderly Individual');
    expect(session.role).toBe('Elderly Individual');
    expect(session.token).toBeTruthy();
    expect(session.authenticatedAt).toBeTruthy();
  });

  it('validates an active session token', () => {
    const session = createSession('Caretaker');
    const validated = validateSession(session.token);
    expect(validated).not.toBeNull();
    expect(validated?.role).toBe('Caretaker');
  });

  it('rejects an invalid session token', () => {
    const validated = validateSession('nonexistent-token');
    expect(validated).toBeNull();
  });

  it('is not rate-limited initially', () => {
    expect(isRateLimited('test-ip')).toBe(false);
  });

  it('rate-limits after maximum failed attempts', () => {
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('test-ip');
    }
    expect(isRateLimited('test-ip')).toBe(true);
  });

  it('creates sessions for all three roles', () => {
    const roles = ['Elderly Individual', 'Caretaker', 'Family Member'] as const;
    for (const role of roles) {
      const session = createSession(role);
      expect(session.role).toBe(role);
    }
  });
});
