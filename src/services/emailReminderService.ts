/**
 * Proactive Email Reminder Engine.
 * Problem Statement Requirement: "Proactively send email reminders for missed
 * medications, upcoming doses, and medical appointments" within a shared ecosystem.
 */
import type { EmailDispatchLog, ReminderTrigger, EmailDeliveryStatus, Medication } from '@/types';
import { REMINDER_CONFIG } from '@/config/constants';
import { getMedications, getAppointments, addEmailLog, getConsent, getAdherenceRecords } from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';

/** Checks if real SMTP credentials exist in environment variables. */
function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** Sends an email via real SMTP transport with a 5000ms timeout guard. */
async function sendRealEmail(to: string, subject: string, body: string): Promise<EmailDeliveryStatus> {
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    });
    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text: body });
    return 'Delivered';
  } catch {
    return 'Failed';
  }
}

/** Logs a structured email dispatch entry to the telemetry audit log. */
function logDispatch(
  recipient: string, subject: string, trigger: ReminderTrigger, status: EmailDeliveryStatus, body: string
): EmailDispatchLog {
  const entry: EmailDispatchLog = {
    id: `email-${generateId()}`, recipient, subject, triggerReason: trigger,
    timestamp: nowISO(), deliveryStatus: status, body,
  };
  addEmailLog(entry);
  return entry;
}

/** Dispatches an email via real SMTP or deterministic mock transport. */
async function dispatchEmail(
  recipient: string, subject: string, body: string, trigger: ReminderTrigger
): Promise<EmailDispatchLog> {
  const status: EmailDeliveryStatus = isSmtpConfigured()
    ? await sendRealEmail(recipient, subject, body)
    : 'Delivered';
  return logDispatch(recipient, subject, trigger, status, body);
}

function getRecipients() {
  return {
    elderly: process.env.ELDERLY_EMAIL ?? 'elderly@example.com',
    caretaker: process.env.CARETAKER_EMAIL ?? 'caretaker@example.com',
    family: process.env.FAMILY_EMAIL ?? 'family@example.com',
  };
}

/** Checks for upcoming medication doses within the configured time window. */
export async function checkUpcomingDoses(): Promise<EmailDispatchLog[]> {
  const now = Date.now();
  const window = REMINDER_CONFIG.UPCOMING_DOSE_WINDOW_MS;
  const meds = getMedications().filter((m) => m.isActive);
  const dispatches: Promise<EmailDispatchLog>[] = [];
  const recipients = getRecipients();
  const todayStr = new Date().toISOString().slice(0, 10);

  for (const med of meds) {
    for (const time of med.scheduledTimes) {
      const diff = new Date(`${todayStr}T${time}:00Z`).getTime() - now;
      if (diff > 0 && diff <= window) {
        const body = `Reminder: ${med.medicationName} ${med.dosage} is due at ${time}.`;
        dispatches.push(dispatchEmail(recipients.elderly, `Upcoming Dose: ${med.medicationName}`, body, 'Upcoming Medication Dose'));
      }
    }
  }
  return Promise.all(dispatches);
}

/** Resolves missed dose alerts respecting elderly autonomy consent preferences. */
function queueMissedAlerts(
  med: Medication, time: string, recipients: ReturnType<typeof getRecipients>,
  consent: ReturnType<typeof getConsent>, queue: Promise<EmailDispatchLog>[]
): void {
  const body = `ALERT: ${med.medicationName} ${med.dosage} was missed at ${time}.`;
  if (consent.shareWithCaretaker) {
    queue.push(dispatchEmail(recipients.caretaker, `Missed Dose: ${med.medicationName}`, body, 'Missed Medication'));
  }
  if (consent.shareWithFamily) {
    queue.push(dispatchEmail(recipients.family, `Missed Dose: ${med.medicationName}`, body, 'Missed Medication'));
  }
}

/** Checks for missed medication doses and escalates to care circle based on consent. */
export async function checkMissedDoses(): Promise<EmailDispatchLog[]> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const meds = getMedications().filter((m) => m.isActive);
  const records = getAdherenceRecords();
  const consent = getConsent();
  const dispatches: Promise<EmailDispatchLog>[] = [];
  const recipients = getRecipients();

  const todayRecordedMeds = new Set(
    records.filter((r) => r.scheduledTime.includes(todayStr) || r.recordedAt.includes(todayStr)).map((r) => r.medicationId)
  );

  for (const med of meds) {
    for (const time of med.scheduledTimes) {
      if (new Date(`${todayStr}T${time}:00Z`).getTime() < Date.now() && !todayRecordedMeds.has(med.id)) {
        queueMissedAlerts(med, time, recipients, consent, dispatches);
      }
    }
  }
  return Promise.all(dispatches);
}

/** Checks for upcoming appointments and sends 2h or 24h advance notices. */
export async function checkUpcomingAppointments(): Promise<EmailDispatchLog[]> {
  const now = Date.now();
  const apts = getAppointments();
  const dispatches: Promise<EmailDispatchLog>[] = [];
  const recipients = getRecipients();

  for (const apt of apts) {
    const diff = new Date(apt.appointmentDateTime).getTime() - now;
    if (diff > 0 && diff <= REMINDER_CONFIG.APPOINTMENT_2H_MS) {
      const body = `Appointment with ${apt.doctorName} (${apt.specialty}) in 2 hours at ${apt.location}.`;
      dispatches.push(dispatchEmail(recipients.elderly, `Appointment Soon: ${apt.doctorName}`, body, 'Upcoming Appointment 2h'));
    } else if (diff > 0 && diff <= REMINDER_CONFIG.APPOINTMENT_24H_MS) {
      const body = `Upcoming appointment with ${apt.doctorName} (${apt.specialty}) tomorrow at ${apt.location}. ${apt.preparationNotes}`;
      dispatches.push(dispatchEmail(recipients.elderly, `Appointment Tomorrow: ${apt.doctorName}`, body, 'Upcoming Appointment 24h'));
    }
  }
  return Promise.all(dispatches);
}

/** Runs all reminder checks concurrently and returns combined results. */
export async function dispatchAllReminders(): Promise<EmailDispatchLog[]> {
  const [doses, missed, apts] = await Promise.all([
    checkUpcomingDoses(), checkMissedDoses(), checkUpcomingAppointments(),
  ]);
  return [...doses, ...missed, ...apts];
}
