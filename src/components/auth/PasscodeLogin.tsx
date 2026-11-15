'use client';

import { useState, useCallback } from 'react';
import type { ApiResponse, UserRole, AuthSession } from '@/types';
import { VALID_ROLES } from '@/config/constants';
import BrandLogo from '@/components/ui/BrandLogo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
  ShieldCheck, KeyRound, LogIn, HeartHandshake, Stethoscope, UsersRound,
} from 'lucide-react';

interface PasscodeLoginProps {
  readonly onLogin: (session: AuthSession) => void;
}

/** Passcode-based authentication form with Brand Logo & keypad icons. */
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
      if (data.success && data.data) onLogin(data.data);
      else setError(data.error ?? 'Login failed.');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [passcode, role, onLogin]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <section className="w-full max-w-md bg-surface rounded-2xl p-8 border border-gray-800 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo size="lg" />
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/25 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Passcode Protected Access
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="role-select" className="block text-sm font-semibold text-gray-300 mb-2">
              Select Your Role
            </label>
            <div className="relative">
              <select
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-teal-400 text-sm"
              >
                {VALID_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="absolute left-3 top-3.5 text-gray-400 pointer-events-none">
                {role === 'Elderly Individual' && <HeartHandshake className="w-4 h-4 text-teal-400" />}
                {role === 'Caretaker' && <Stethoscope className="w-4 h-4 text-amber-400" />}
                {role === 'Family Member' && <UsersRound className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="passcode-input" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center justify-between">
              <span>Passcode (4-6 Digits)</span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> PIN: 1234 / 5678 / 9012
              </span>
            </label>
            <div className="relative">
              <input
                id="passcode-input"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-teal-400 text-sm tracking-widest tabular-nums"
                required
                aria-describedby={error ? 'login-error' : undefined}
              />
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {error && (
            <p id="login-error" className="text-danger text-sm" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || passcode.length < 4}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
          >
            <LogIn className="w-5 h-5" aria-hidden="true" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="pt-2 border-t border-gray-800">
            <p className="text-[11px] text-gray-400 font-medium mb-2 text-center">1-Click Judge Quick Login:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setRole('Elderly Individual'); setPasscode('1234'); }}
                className="bg-gray-800 hover:bg-gray-700 border border-teal-500/30 text-teal-300 rounded-lg p-1.5 font-semibold text-center transition-colors"
              >
                Elderly (1234)
              </button>
              <button
                type="button"
                onClick={() => { setRole('Caretaker'); setPasscode('5678'); }}
                className="bg-gray-800 hover:bg-gray-700 border border-amber-500/30 text-amber-300 rounded-lg p-1.5 font-semibold text-center transition-colors"
              >
                Caretaker (5678)
              </button>
              <button
                type="button"
                onClick={() => { setRole('Family Member'); setPasscode('9012'); }}
                className="bg-gray-800 hover:bg-gray-700 border border-emerald-500/30 text-emerald-300 rounded-lg p-1.5 font-semibold text-center transition-colors"
              >
                Family (9012)
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
