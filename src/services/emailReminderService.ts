/**
 * Proactive email reminder engine.
 * Evaluates and dispatches reminders for medications and appointments.
 * Supports real SMTP and a deterministic mock transport with telemetry.
 */
import type { EmailDispatchLog, ReminderTrigger, EmailDeliveryStatus } from '@/types';
import { REMINDER_CONFIG } from '@/config/constants';
import { getMedications, getAppointments, addEmailLog } from '@/store/dataStore';
import { getAdherenceRecords } from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';

/** Checks if real SMTP is configured. */
function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/** Sends an email via real SMTP transport. */
async function sendRealEmail(
  to: string, subject: string, body: string
): Promise<EmailDeliveryStatus> {
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER, to, subject, text: body,
    });
    return 'Delivered';
  } catch {
    return 'Failed';
  }
}

/** Logs a structured email dispatch entry (mock or real). */
function logDispatch(
  recipient: string, subject: string,
  trigger: ReminderTrigger, status: EmailDeliveryStatus, body: string
): EmailDispatchLog {
  const entry: EmailDispatchLog = {
    id: `email-${generateId()}`,
    recipient, subject, triggerReason: trigger,
    timestamp: nowISO(), deliveryStatus: status, body,
  };
  addEmailLog(entry);
  return entry;
}

/** Dispatches an email via real SMTP or mock transport. */
async function dispatchEmail(
  recipient: string, subject: string,
  body: string, trigger: ReminderTrigger
): Promise<EmailDispatchLog> {
  const status: EmailDeliveryStatus = isSmtpConfigured()
    ? await sendRealEmail(recipient, subject, body)
    : 'Delivered';
  return logDispatch(recipient, subject, trigger, status, body);
}

/** Returns recipient emails from environment. */
function getRecipients() {
  return {
    elderly: process.env.ELDERLY_EMAIL ?? 'elderly@example.com',
    caretaker: process.env.CARETAKER_EMAIL ?? 'caretaker@example.com',
    family: process.env.FAMILY_EMAIL ?? 'family@example.com',
  };
}

/** Checks for upcoming medication doses and dispatches reminders. */
export async function checkUpcomingDoses(): Promise<EmailDispatchLog[]> {
  const now = Date.now();
  const window = REMINDER_CONFIG.UPCOMING_DOSE_WINDOW_MS;
  const meds = getMedications().filter((m) => m.isActive);
  const dispatches: Promise<EmailDispatchLog>[] = [];
  const recipients = getRecipients();

  for (const med of meds) {
    for (const time of med.scheduledTimes) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const scheduled = new Date(`${todayStr}T${time}:00Z`).getTime();
      const diff = scheduled - now;
      if (diff > 0 && diff <= window) {
        const body = `Reminder: ${med.medicationName} ${med.dosage} is due at ${time}.`;
        dispatches.push(
          dispatchEmail(recipients.elderly, `Upcoming Dose: ${med.medicationName}`, body, 'Upcoming Medication Dose')
        );
      }
    }
  }
  return Promise.all(dispatches);
}

/** Checks for missed medication doses and escalates to caregivers. */
export async function checkMissedDoses(): Promise<EmailDispatchLog[]> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const meds = getMedications().filter((m) => m.isActive);
  const records = getAdherenceRecords();
  const dispatches: Promise<EmailDispatchLog>[] = [];
  const recipients = getRecipients();

  for (const med of meds) {
    for (const time of med.scheduledTimes) {
      const scheduled = new Date(`${todayStr}T${time}:00Z`).getTime();
      if (scheduled >= Date.now()) continue;
      const hasRecord = records.some(
        (r) => r.medicationId === med.id && r.scheduledTime.includes(todayStr)
      );
      if (!hasRecord) {
        const body = `ALERT: ${med.medicationName} ${med.dosage} was missed at ${time}.`;
        dispatches.push(
          dispatchEmail(recipients.caretaker, `Missed Dose: ${med.medicationName}`, body, 'Missed Medication'),
          dispatchEmail(recipients.family, `Missed Dose: ${med.medicationName}`, body, 'Missed Medication')
        );
      }
    }
  }
  return Promise.all(dispatches);
}

/** Checks for upcoming appointments and sends advance notices. */
export async function checkUpcomingAppointments(): Promise<EmailDispatchLog[]> {
  const now = Date.now();
  const apts = getAppointments();
  const dispatches: Promise<EmailDispatchLog>[] = [];
  const recipients = getRecipients();

  for (const apt of apts) {
    const aptTime = new Date(apt.appointmentDateTime).getTime();
    const diff = aptTime - now;
    if (diff > 0 && diff <= REMINDER_CONFIG.APPOINTMENT_2H_MS) {
      const body = `Appointment with ${apt.doctorName} (${apt.specialty}) in 2 hours at ${apt.location}.`;
      dispatches.push(
        dispatchEmail(recipients.elderly, `Appointment Soon: ${apt.doctorName}`, body, 'Upcoming Appointment 2h')
      );
    } else if (diff > 0 && diff <= REMINDER_CONFIG.APPOINTMENT_24H_MS) {
      const body = `Upcoming appointment with ${apt.doctorName} (${apt.specialty}) tomorrow at ${apt.location}. ${apt.preparationNotes}`;
      dispatches.push(
        dispatchEmail(recipients.elderly, `Appointment Tomorrow: ${apt.doctorName}`, body, 'Upcoming Appointment 24h')
      );
    }
  }
  return Promise.all(dispatches);
}

/** Runs all reminder checks concurrently and returns combined results. */
export async function dispatchAllReminders(): Promise<EmailDispatchLog[]> {
  const [doses, missed, apts] = await Promise.all([
    checkUpcomingDoses(),
    checkMissedDoses(),
    checkUpcomingAppointments(),
  ]);
  return [...doses, ...missed, ...apts];
}
