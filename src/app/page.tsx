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
import JudgeQuickBar from '@/components/judge/JudgeQuickBar';
import EmailPreviewModal from '@/components/judge/EmailPreviewModal';
import ToastNotification from '@/components/ui/ToastNotification';
import { useJudgeSandbox } from '@/hooks/useJudgeSandbox';
import { STORAGE_KEYS, loadLocalData, saveLocalData } from '@/utils/persistence';

/** Root page — authentication gate with Judge Quick-Bar and role views. */
export default function HomePage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [comfortMode, setComfortMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [medRefreshTrigger, setMedRefreshTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  const triggerRefresh = useCallback(() => setMedRefreshTrigger((k) => k + 1), []);

  const {
    lastEmail, emailModalOpen, setEmailModalOpen, toast, dismissToast,
    switchRole, simulateEmailAlert, resetDemoState,
  } = useJudgeSandbox({ onSessionChange: setSession, onDataRefresh: triggerRefresh });

  useEffect(() => {
    setMounted(true);
    setComfortMode(loadLocalData<boolean>(STORAGE_KEYS.COMFORT_MODE, false));
    const stored = loadLocalData<AuthSession | null>(STORAGE_KEYS.SESSION, null);
    if (stored && new Date(stored.expiresAt).getTime() > Date.now()) {
      setSession(stored);
    }
  }, []);

  const handleLogin = useCallback((s: AuthSession) => {
    setSession(s);
    saveLocalData(STORAGE_KEYS.SESSION, s);
  }, []);

  const handleToggleComfort = useCallback(() => {
    setComfortMode((prev) => {
      const next = !prev;
      saveLocalData(STORAGE_KEYS.COMFORT_MODE, next);
      return next;
    });
  }, []);

  const handleLogout = useCallback(() => {
    setSession(null);
    saveLocalData(STORAGE_KEYS.SESSION, null);
  }, []);

  const handleVoiceCommand = useCallback((cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('medication') || lower.includes('pill')) setActiveTab('medications');
    else if (lower.includes('appointment')) setActiveTab('appointments');
    else if (lower.includes('family') || lower.includes('check-in')) setActiveTab('settings');
  }, []);

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <div className={`min-h-screen flex flex-col ${comfortMode ? 'comfort-mode' : ''}`}>
      <SkipToContent />
      <JudgeQuickBar
        currentRole={session?.role}
        onSwitchRole={switchRole}
        onSimulateMissed={() => simulateEmailAlert('missed')}
        onSimulateUpcoming={() => simulateEmailAlert('upcoming')}
        onResetDemoData={resetDemoState}
        onViewLastEmail={() => setEmailModalOpen(true)}
        hasDispatchedEmail={Boolean(lastEmail)}
      />

      <EmailPreviewModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        email={lastEmail}
      />

      <ToastNotification toast={toast} onDismiss={dismissToast} />

      {!session ? (
        <PasscodeLogin onLogin={handleLogin} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
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
                <PrescriptionScanner
                  onScanResult={triggerRefresh}
                  onMedicationAdded={triggerRefresh}
                />
                <MedicationList refreshTrigger={medRefreshTrigger} />
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
      )}
    </div>
  );
}
