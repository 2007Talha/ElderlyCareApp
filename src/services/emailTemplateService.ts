/**
 * Medical-grade responsive HTML email templates for proactive healthcare notifications.
 * Problem Statement Requirement: "Proactively send email reminders for missed medications,
 * upcoming doses, and medical appointments" within an interconnected ecosystem.
 */

/** Common email header component with Brand Logo and status pill. */
function renderEmailHeader(title: string, badgeText: string, badgeBg: string): string {
  return `
    <div style="background-color:#0f172a;padding:24px;border-bottom:1px solid #1e293b;border-radius:12px 12px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#2dd4bf;font-weight:700;font-size:18px;letter-spacing:-0.5px;">🏥 CarePulse Platform</span>
        <span style="background-color:${badgeBg};color:#ffffff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:9999px;">${badgeText}</span>
      </div>
      <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:16px 0 0 0;">${title}</h1>
    </div>
  `;
}

/** Common email footer with healthcare autonomy disclaimer and emergency notice. */
function renderEmailFooter(): string {
  return `
    <div style="background-color:#0b1120;padding:16px 24px;border-top:1px solid #1e293b;border-radius:0 0 12px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:#94a3b8;line-height:1.5;">
      <p style="margin:0 0 6px 0;">🛡️ <strong>Elderly Healthcare Autonomy:</strong> The elderly individual remains at the centre of their own healthcare decisions with consent-governed family & caretaker sharing.</p>
      <p style="margin:0;">CarePulse Automated Health Monitoring Engine • If this is a medical emergency, please dial 911 immediately.</p>
    </div>
  `;
}

/** Generates rich clinical HTML for a missed medication dose alert. */
export function generateMissedDoseHtml(
  medName: string, dosage: string, time: string, patientName = 'Eleanor Vance'
): string {
  return `
    <div style="max-width:580px;margin:0 auto;background-color:#1e293b;border:1px solid #dc2626;border-radius:12px;overflow:hidden;color:#f8fafc;">
      ${renderEmailHeader('🚨 URGENT: Missed Medication Escalation', 'ESCALATION ALERT', '#dc2626')}
      <div style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;">
        <div style="background-color:rgba(220,38,38,0.12);border-left:4px solid #ef4444;padding:14px;border-radius:6px;margin-bottom:18px;">
          <strong style="color:#fca5a5;font-size:14px;">Missed Dose Overdue Alert</strong>
          <p style="margin:4px 0 0 0;font-size:13px;color:#fecaca;">Patient <strong>${patientName}</strong> was scheduled to take their dose at <strong>${time}</strong> but intake has not been confirmed.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">
          <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 0;color:#94a3b8;">Medication</td><td style="padding:8px 0;font-weight:600;color:#ffffff;text-align:right;">${medName}</td></tr>
          <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 0;color:#94a3b8;">Prescribed Dosage</td><td style="padding:8px 0;font-weight:600;color:#2dd4bf;text-align:right;">${dosage}</td></tr>
          <tr style="border-bottom:1px solid #334155;"><td style="padding:8px 0;color:#94a3b8;">Scheduled Slot</td><td style="padding:8px 0;font-weight:600;color:#ffffff;text-align:right;">${time}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;">Care Circle Notified</td><td style="padding:8px 0;color:#38bdf8;text-align:right;">Caretaker & Family Network</td></tr>
        </table>
        <p style="font-size:12px;color:#94a3b8;margin-bottom:0;">Please check in with the patient or confirm whether the dose was delayed.</p>
      </div>
      ${renderEmailFooter()}
    </div>
  `;
}

/** Generates rich clinical HTML for upcoming dose reminders. */
export function generateUpcomingDoseHtml(
  medName: string, dosage: string, time: string, instructions = 'Take with water as prescribed.'
): string {
  return `
    <div style="max-width:580px;margin:0 auto;background-color:#1e293b;border:1px solid #0d9488;border-radius:12px;overflow:hidden;color:#f8fafc;">
      ${renderEmailHeader('💊 Upcoming Dose Reminder', 'SCHEDULE NOTICE', '#0d9488')}
      <div style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;">
        <p style="margin:0 0 16px 0;font-size:14px;color:#e2e8f0;">Your scheduled medication is due shortly:</p>
        <div style="background-color:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="font-size:18px;font-weight:700;color:#2dd4bf;">${medName} — ${dosage}</div>
          <div style="font-size:13px;color:#94a3b8;margin-top:4px;">Scheduled for <strong>${time}</strong></div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:8px;font-style:italic;">"${instructions}"</div>
        </div>
      </div>
      ${renderEmailFooter()}
    </div>
  `;
}

/** Generates rich clinical HTML for upcoming doctor appointments. */
export function generateAppointmentHtml(
  doctorName: string, specialty: string, dateTime: string, location: string, prep = 'None'
): string {
  return `
    <div style="max-width:580px;margin:0 auto;background-color:#1e293b;border:1px solid #d97706;border-radius:12px;overflow:hidden;color:#f8fafc;">
      ${renderEmailHeader('📅 Upcoming Medical Appointment', 'DOCTOR VISIT', '#d97706')}
      <div style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;">
        <p style="margin:0 0 16px 0;font-size:14px;color:#e2e8f0;">You have an upcoming medical consultation scheduled:</p>
        <div style="background-color:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;margin-bottom:16px;font-size:13px;">
          <p style="margin:0 0 8px 0;font-size:16px;font-weight:700;color:#fbbf24;">${doctorName} (${specialty})</p>
          <p style="margin:0 0 6px 0;color:#cbd5e1;">📍 <strong>Location:</strong> ${location}</p>
          <p style="margin:0 0 6px 0;color:#cbd5e1;">⏰ <strong>Date & Time:</strong> ${dateTime}</p>
          <p style="margin:0;color:#94a3b8;">📝 <strong>Preparation:</strong> ${prep}</p>
        </div>
      </div>
      ${renderEmailFooter()}
    </div>
  `;
}
