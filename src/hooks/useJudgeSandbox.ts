'use client';

import { useState, useCallback } from 'react';
import type { UserRole, AuthSession, EmailDispatchLog, ApiResponse } from '@/types';
import type { ToastData } from '@/components/ui/ToastNotification';
import { clearAllLocalData, STORAGE_KEYS, saveLocalData } from '@/utils/persistence';

interface UseJudgeSandboxProps {
  readonly onSessionChange: (session: AuthSession) => void;
  readonly onDataRefresh: () => void;
}

/**
 * Custom hook managing Round 2 Judge Sandbox quick actions, email simulation, and data resets.
 */
export function useJudgeSandbox({ onSessionChange, onDataRefresh }: UseJudgeSandboxProps) {
  const [lastEmail, setLastEmail] = useState<EmailDispatchLog | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((msg: string, type: ToastData['type'], actionLabel?: string, onAction?: () => void) => {
    setToast({ id: `t-${Date.now()}`, message: msg, type, actionLabel, onAction });
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const session: AuthSession = {
      token: `judge-${Date.now()}`, role,
      authenticatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    };
    saveLocalData(STORAGE_KEYS.SESSION, session);
    onSessionChange(session);
    showToast(`Switched active view to ${role} (1-Click Judge Access)`, 'success');
  }, [onSessionChange, showToast]);

  const simulateEmailAlert = useCallback(async (scenario: 'missed' | 'upcoming') => {
    try {
      const res = await fetch(`/api/reminders/dispatch?simulate=${scenario}`, { method: 'POST' });
      const data: ApiResponse<{ dispatched: number; logs: EmailDispatchLog[] }> = await res.json();
      if (data.success && data.data?.logs[0]) {
        const log = data.data.logs[0];
        setLastEmail(log);
        saveLocalData(STORAGE_KEYS.LAST_DISPATCHED_EMAIL, log);
        setEmailModalOpen(true);
        showToast(
          `✉️ Dispatched ${scenario === 'missed' ? 'Missed Dose Escalation' : 'Upcoming Dose Reminder'}!`,
          'email', 'View Rendered Email', () => setEmailModalOpen(true)
        );
        onDataRefresh();
      }
    } catch {
      showToast('Simulation trigger error.', 'warning');
    }
  }, [showToast, onDataRefresh]);

  const resetDemoState = useCallback(async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      clearAllLocalData();
      onDataRefresh();
      showToast('🔄 Demo state restored to clean initial seed data!', 'info');
    } catch {
      showToast('Reset failed.', 'warning');
    }
  }, [onDataRefresh, showToast]);

  return {
    lastEmail, emailModalOpen, setEmailModalOpen, toast,
    dismissToast: () => setToast(null),
    switchRole, simulateEmailAlert, resetDemoState,
  };
}
