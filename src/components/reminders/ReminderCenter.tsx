'use client';

import { useState } from 'react';
import type { UserRole } from '@/types';
import ElderlyReminderView from './ElderlyReminderView';
import CaretakerReminderView from './CaretakerReminderView';
import FamilyReminderView from './FamilyReminderView';
import EmailLog from './EmailLog';
import { MailCheck, Bell, Shield, HeartHandshake, Stethoscope, UsersRound } from 'lucide-react';

interface ReminderCenterProps {
  readonly role: UserRole;
}

/** Unified, persona-tailored Reminders & Escalation Center for all 3 modes. */
export default function ReminderCenter({ role }: ReminderCenterProps) {
  const [showTechnicalLogs, setShowTechnicalLogs] = useState(false);

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-400" aria-hidden="true" />
          <h2 className="text-lg font-bold">
            Reminders Center — <span className="text-teal-400">{role} Mode</span>
          </h2>
        </div>

        <button
          onClick={() => setShowTechnicalLogs(!showTechnicalLogs)}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
        >
          <MailCheck className="w-4 h-4" />
          {showTechnicalLogs ? 'Back to Mode Reminders' : 'View Email Delivery Logs'}
        </button>
      </div>

      {showTechnicalLogs ? (
        <EmailLog />
      ) : (
        <>
          {role === 'Elderly Individual' && <ElderlyReminderView />}
          {role === 'Caretaker' && <CaretakerReminderView />}
          {role === 'Family Member' && <FamilyReminderView />}
        </>
      )}
    </div>
  );
}
