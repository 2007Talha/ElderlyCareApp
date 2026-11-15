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
import AppHeader from '@/components/layout/AppHeader';
import ConsentToggle from '@/components/shared/ConsentToggle';
import SkipToContent from '@/components/a11y/SkipToContent';

const SESSION_KEY = 'eldercare_session';
const COMFORT_KEY = 'eldercare_comfort_mode';

/** Root page — authentication gate with local persistence and role views. */
export default function HomePage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [comfortMode, setComfortMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main id="main-content" className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <AppHeader
          role={session.role}
          comfortMode={comfortMode}
          onToggleComfort={handleToggleComfort}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />

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
