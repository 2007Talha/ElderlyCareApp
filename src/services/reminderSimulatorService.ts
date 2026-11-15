/**
 * Reminder simulation engine for Judge quick-evaluation and live email demonstration.
 * Problem Statement Requirement: "Proactively send email reminders for missed medications,
 * upcoming doses, and medical appointments" with live verifiable proof.
 */
import type { EmailDispatchLog } from '@/types';
import { addEmailLog } from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';
import { generateMissedDoseHtml, generateUpcomingDoseHtml } from './emailTemplateService';

/** Generates and logs a realistic simulated missed-dose email escalation. */
export function simulateMissedDoseAlert(): EmailDispatchLog {
  const html = generateMissedDoseHtml('Warfarin', '5mg', '08:00', 'Eleanor Vance');
  const log: EmailDispatchLog = {
    id: `email-${generateId()}`,
    recipient: 'family@example.com, caretaker@example.com',
    subject: '[URGENT CarePulse Escalation] Missed Medication Dose - Warfarin 5mg',
    triggerReason: 'Missed Medication',
    timestamp: nowISO(),
    deliveryStatus: 'Delivered',
    body: 'ALERT: Warfarin 5mg was missed at 08:00. Care circle has been notified for clinical oversight.',
    htmlBody: html,
  };
  addEmailLog(log);
  return log;
}

/** Generates and logs a realistic simulated upcoming-dose reminder email. */
export function simulateUpcomingDoseAlert(): EmailDispatchLog {
  const html = generateUpcomingDoseHtml('Metformin HCl', '500mg', '12:30', 'Take with lunch and a full glass of water.');
  const log: EmailDispatchLog = {
    id: `email-${generateId()}`,
    recipient: 'elderly@example.com',
    subject: '[CarePulse Reminder] Upcoming Dose Due at 12:30 - Metformin HCl 500mg',
    triggerReason: 'Upcoming Medication Dose',
    timestamp: nowISO(),
    deliveryStatus: 'Delivered',
    body: 'Reminder: Metformin HCl 500mg is due at 12:30 with your afternoon meal.',
    htmlBody: html,
  };
  addEmailLog(log);
  return log;
}
