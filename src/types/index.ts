/** Domain types for the Elderly Care & Medication Management Platform. */

/** Supported user roles in the shared healthcare ecosystem. */
export type UserRole = 'Elderly Individual' | 'Caretaker' | 'Family Member';

/** Medication dose intake status options. */
export type DoseStatus = 'Taken' | 'Missed' | 'Snoozed' | 'Skipped';

/** Appointment reminder delivery status. */
export type ReminderStatus = 'Pending' | 'Sent' | 'Acknowledged';

/** Email delivery status for the telemetry log. */
export type EmailDeliveryStatus = 'Delivered' | 'Queued' | 'Failed';

/** Email reminder trigger reason categories. */
export type ReminderTrigger =
  | 'Upcoming Medication Dose'
  | 'Missed Medication'
  | 'Upcoming Appointment 24h'
  | 'Upcoming Appointment 2h'
  | 'Low Inventory Alert'
  | 'Caretaker Care Check-in';

/** Authenticated session payload. */
export interface AuthSession {
  readonly token: string;
  readonly role: UserRole;
  readonly authenticatedAt: string;
  readonly expiresAt: string;
}

/** Medication schedule record. */
export interface Medication {
  readonly id: string;
  readonly medicationName: string;
  readonly dosage: string;
  readonly frequency: string;
  readonly scheduledTimes: string[];
  readonly inventoryCount: number;
  readonly instructions: string;
  readonly prescribedBy: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Adherence log entry for a single dose event. */
export interface AdherenceRecord {
  readonly id: string;
  readonly medicationId: string;
  readonly status: DoseStatus;
  readonly scheduledTime: string;
  readonly recordedAt: string;
  readonly recordedBy: UserRole;
  readonly notes: string;
}

/** Medical appointment record. */
export interface Appointment {
  readonly id: string;
  readonly doctorName: string;
  readonly specialty: string;
  readonly appointmentDateTime: string;
  readonly location: string;
  readonly preparationNotes: string;
  readonly reminderStatus: ReminderStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Structured email dispatch telemetry entry. */
export interface EmailDispatchLog {
  readonly id: string;
  readonly recipient: string;
  readonly subject: string;
  readonly triggerReason: ReminderTrigger;
  readonly timestamp: string;
  readonly deliveryStatus: EmailDeliveryStatus;
  readonly body: string;
}

/** Elderly consent / sharing preferences. */
export interface ConsentPreferences {
  readonly shareWithCaretaker: boolean;
  readonly shareWithFamily: boolean;
  readonly allowScheduleModifications: boolean;
}

/** Structured API response envelope. */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
}

/** Smart Care Assistant message. */
export interface AssistantMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: string;
}

/** Drug interaction warning. */
export interface DrugInteraction {
  readonly drugA: string;
  readonly drugB: string;
  readonly severity: 'Low' | 'Moderate' | 'High';
  readonly description: string;
}

/** Prescription scan result from label analysis. */
export interface PrescriptionScanResult {
  readonly medicationName: string;
  readonly dosage: string;
  readonly frequency: string;
  readonly instructions: string;
}
