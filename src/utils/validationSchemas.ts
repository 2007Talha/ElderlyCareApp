import { z } from 'zod';
import { VALID_ROLES, DOSE_STATUSES } from '@/config/constants';

/** Passcode login request schema. */
export const passcodeLoginSchema = z.object({
  passcode: z
    .string()
    .min(4, 'Passcode must be at least 4 digits')
    .max(6, 'Passcode must be at most 6 digits')
    .regex(/^\d+$/, 'Passcode must contain only digits'),
  role: z.enum(VALID_ROLES),
});

/** Medication creation/update schema. */
export const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required').max(100),
  dosage: z.string().min(1, 'Dosage is required').max(50),
  frequency: z.string().min(1, 'Frequency is required').max(50),
  scheduledTimes: z.array(z.string()).min(1, 'At least one time required'),
  inventoryCount: z.number().int().min(0, 'Inventory cannot be negative'),
  instructions: z.string().max(500).default(''),
  prescribedBy: z.string().min(1, 'Prescriber is required').max(100),
  isActive: z.boolean().default(true),
});

/** Adherence log entry schema. */
export const adherenceSchema = z.object({
  medicationId: z.string().min(1),
  status: z.enum(DOSE_STATUSES),
  scheduledTime: z.string().min(1),
  recordedBy: z.enum(VALID_ROLES),
  notes: z.string().max(300).default(''),
});

/** Appointment creation/update schema. */
export const appointmentSchema = z.object({
  doctorName: z.string().min(1, 'Doctor name is required').max(100),
  specialty: z.string().min(1, 'Specialty is required').max(100),
  appointmentDateTime: z.string().min(1, 'Date/time is required'),
  location: z.string().min(1, 'Location is required').max(200),
  preparationNotes: z.string().max(500).default(''),
  reminderStatus: z.enum(['Pending', 'Sent', 'Acknowledged']).default('Pending'),
});

/** Reminder dispatch request schema. */
export const reminderDispatchSchema = z.object({
  type: z.enum(['medication', 'appointment', 'all']).default('all'),
});

/** Assistant query schema. */
export const assistantQuerySchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000),
  role: z.enum(VALID_ROLES),
});

/** Consent preferences schema. */
export const consentSchema = z.object({
  shareWithCaretaker: z.boolean(),
  shareWithFamily: z.boolean(),
  allowScheduleModifications: z.boolean(),
});

/** Type exports inferred from schemas. */
export type PasscodeLoginInput = z.infer<typeof passcodeLoginSchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;
export type AdherenceInput = z.infer<typeof adherenceSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type AssistantQueryInput = z.infer<typeof assistantQuerySchema>;
