'use client';

import { useState, useCallback } from 'react';
import type { AuthSession, PrescriptionScanResult } from '@/types';
import PasscodeLogin from '@/components/auth/PasscodeLogin';
import Sidebar from '@/components/layout/Sidebar';
import type { TabId } from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import MedicationList from '@/components/medications/MedicationList';
import AdherenceTracker from '@/components/adherence/AdherenceTracker';
import AppointmentList from '@/components/appointments/AppointmentList';
import EmailLog from '@/components/reminders/EmailLog';
import SmartAssistant from '@/components/assistant/SmartAssistant';
import VoiceCommandBar from '@/components/assistant/VoiceCommandBar';
import PrescriptionScanner from '@/components/assistant/PrescriptionScanner';
import ComfortModeToggle from '@/components/shared/ComfortModeToggle';
import ConsentToggle from '@/components/shared/ConsentToggle';

/** Root page — authentication gate then role-tailored application shell. */
export default function HomePage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [comfortMode, setComfortMode] = useState(false);

  const handleLogin = useCallback((s: AuthSession) => {
    setSession(s);
    if (s.role === 'Elderly Individual') setComfortMode(true);
  }, []);

  const handleLogout = useCallback(() => setSession(null), []);

  const handleVoiceCommand = useCallback((cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('medication') || lower.includes('pill')) {
      setActiveTab('medications');
    } else if (lower.includes('appointment')) {
      setActiveTab('appointments');
    } else if (lower.includes('family') || lower.includes('check-in')) {
      setActiveTab('settings');
    }
  }, []);

  const handleScanResult = useCallback((_result: PrescriptionScanResult) => {
    setActiveTab('medications');
  }, []);

  if (!session) {
    return <PasscodeLogin onLogin={handleLogin} />;
  }

  return (
    <div className={`flex min-h-screen ${comfortMode ? 'comfort-mode' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={session.role}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {session.role}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {session.role === 'Elderly Individual' && 'Primary Decision-Maker • Full Privacy Autonomy'}
              {session.role === 'Caretaker' && 'Healthcare Clinical Oversight & Supply Management'}
              {session.role === 'Family Member' && 'Family Peace-of-Mind & Support Network'}
            </p>
          </div>
          <ComfortModeToggle
            enabled={comfortMode}
            onToggle={() => setComfortMode(!comfortMode)}
          />
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
        {activeTab === 'reminders' && <EmailLog />}
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
