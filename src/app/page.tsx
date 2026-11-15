'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AuthSession } from '@/types';
import PasscodeLogin from '@/components/auth/PasscodeLogin';
import Sidebar from '@/components/layout/Sidebar';
import type { TabId } from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import MedicationList from '@/components/medications/MedicationList';
import AdherenceTracker from '@/components/adherence/AdherenceTracker';
import AppointmentList from '@/components/appointments/AppointmentList';
import EmailLog from '@/components/reminders/EmailLog';
import ReminderCenter from '@/components/reminders/ReminderCenter';
import SmartAssistant from '@/components/assistant/SmartAssistant';
import VoiceCommandBar from '@/components/assistant/VoiceCommandBar';
import PrescriptionScanner from '@/components/assistant/PrescriptionScanner';
import ComfortModeToggle from '@/components/shared/ComfortModeToggle';
import ConsentToggle from '@/components/shared/ConsentToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SkipToContent from '@/components/a11y/SkipToContent';
import { HeartHandshake, Stethoscope, UsersRound } from 'lucide-react';

const SESSION_KEY = 'eldercare_session';
const COMFORT_KEY = 'eldercare_comfort_mode';

/** Root page — authentication gate with local persistence and role views. */
export default function HomePage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [comfortMode, setComfortMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedComfort = localStorage.getItem(COMFORT_KEY);
      if (savedComfort !== null) setComfortMode(savedComfort === 'true');

      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          setSession(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch { /* graceful fallback */ }
  }, []);

  const handleLogin = useCallback((s: AuthSession) => {
    setSession(s);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      const savedComfort = localStorage.getItem(COMFORT_KEY);
      if (savedComfort !== null) setComfortMode(savedComfort === 'true');
    } catch { /* ignore */ }
  }, []);

  const handleToggleComfort = useCallback(() => {
    setComfortMode((prev) => {
      const next = !prev;
      try { localStorage.setItem(COMFORT_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleLogout = useCallback(() => {
    setSession(null);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, []);

  const handleVoiceCommand = useCallback((cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('medication') || lower.includes('pill')) setActiveTab('medications');
    else if (lower.includes('appointment')) setActiveTab('appointments');
    else if (lower.includes('family') || lower.includes('check-in')) setActiveTab('settings');
  }, []);

  const handleScanResult = useCallback(() => {
    setActiveTab('medications');
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!session) {
    return <PasscodeLogin onLogin={handleLogin} />;
  }

  return (
    <div className={`flex min-h-screen ${comfortMode ? 'comfort-mode' : ''}`}>
      <SkipToContent />
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={session.role}
        onLogout={handleLogout}
      />

      <main id="main-content" className="flex-1 p-6 overflow-y-auto">
        <header className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {session.role === 'Elderly Individual' && <HeartHandshake className="w-6 h-6 text-teal-400" />}
              {session.role === 'Caretaker' && <Stethoscope className="w-6 h-6 text-amber-400" />}
              {session.role === 'Family Member' && <UsersRound className="w-6 h-6 text-emerald-400" />}
              Welcome, {session.role}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {session.role === 'Elderly Individual' && 'Primary Decision-Maker • Full Privacy Autonomy'}
              {session.role === 'Caretaker' && 'Healthcare Clinical Oversight & Supply Management'}
              {session.role === 'Family Member' && 'Family Peace-of-Mind & Support Network'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ComfortModeToggle
              enabled={comfortMode}
              onToggle={handleToggleComfort}
            />
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <Dashboard
            role={session.role}
            onVoiceClick={() => setActiveTab('assistant')}
          />
        )}
        {activeTab === 'medications' && (
          <div className="space-y-6">
            <PrescriptionScanner onScanResult={handleScanResult} />
            <MedicationList />
          </div>
        )}
        {activeTab === 'adherence' && <AdherenceTracker />}
        {activeTab === 'appointments' && <AppointmentList />}
        {activeTab === 'reminders' && <ReminderCenter role={session.role} />}
        {activeTab === 'assistant' && (
          <div className="space-y-6">
            <VoiceCommandBar onCommand={handleVoiceCommand} />
            <SmartAssistant role={session.role} />
          </div>
        )}
        {activeTab === 'email-log' && <EmailLog />}
        {activeTab === 'settings' && <ConsentToggle role={session.role} />}
      </main>
    </div>
  );
}
