'use client';

import { useState, useCallback } from 'react';
import type { ApiResponse, UserRole, AuthSession } from '@/types';
import { VALID_ROLES } from '@/config/constants';
import { Shield, LogIn } from 'lucide-react';

interface PasscodeLoginProps {
  readonly onLogin: (session: AuthSession) => void;
}

/** Passcode-based authentication form with role selection. */
export default function PasscodeLogin({ onLogin }: PasscodeLoginProps) {
  const [passcode, setPasscode] = useState('');
  const [role, setRole] = useState<UserRole>('Elderly Individual');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, role }),
      });
      const data: ApiResponse<AuthSession> = await res.json();
      if (data.success && data.data) {
        onLogin(data.data);
      } else {
        setError(data.error ?? 'Login failed.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [passcode, role, onLogin]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-surface rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-accent" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Secure Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="role-select" className="block text-sm font-medium text-gray-300 mb-2">
              I am a
            </label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent"
            >
              {VALID_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="passcode-input" className="block text-sm font-medium text-gray-300 mb-2">
              Passcode
            </label>
            <input
              id="passcode-input"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter 6-digit passcode"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent"
              required
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          {error && (
            <p id="login-error" className="text-danger text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || passcode.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            <LogIn className="w-5 h-5" aria-hidden="true" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Default passcode: 123456
        </p>
      </section>
    </main>
  );
}
