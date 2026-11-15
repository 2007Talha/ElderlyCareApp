/**
 * Medical Appointments Manager Service.
 * Problem Statement Requirement: "Track adherence and monitor upcoming doctor appointments"
 * with doctor name, specialty, location, preparation notes, and reminder scheduling.
 */
import type { Appointment } from '@/types';
import type { AppointmentInput } from '@/utils/validationSchemas';
import {
  getAppointments, getAppointmentById,
  addAppointment, updateAppointment, deleteAppointment,
} from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';

/**
 * Returns all appointment records.
 * @returns Array of all Appointment records.
 */
export function listAppointments(): Appointment[] {
  return getAppointments();
}

/**
 * Returns only future appointments sorted by date ascending.
 * @returns Array of upcoming Appointment records.
 */
export function listUpcomingAppointments(): Appointment[] {
  const now = Date.now();
  return getAppointments()
    .filter((a) => new Date(a.appointmentDateTime).getTime() > now)
    .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime());
}

/**
 * Finds a single appointment by id in O(1) time.
 * @param id Unique appointment identifier.
 * @returns Appointment record or undefined.
 */
export function findAppointment(id: string): Appointment | undefined {
  return getAppointmentById(id);
}

/**
 * Creates a new appointment from validated input.
 * @param input Validated appointment payload.
 * @returns Newly created Appointment record.
 */
export function createAppointment(input: AppointmentInput): Appointment {
  const now = nowISO();
  const apt: Appointment = {
    id: `apt-${generateId()}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  return addAppointment(apt);
}

/**
 * Updates an existing appointment by id.
 * @param id Unique appointment identifier.
 * @param input Partial validated fields to update.
 * @returns Updated Appointment record or undefined.
 */
export function editAppointment(
  id: string, input: Partial<AppointmentInput>
): Appointment | undefined {
  return updateAppointment(id, { ...input, updatedAt: nowISO() });
}

/**
 * Removes an appointment by id.
 * @param id Unique appointment identifier.
 * @returns True if appointment was found and deleted.
 */
export function removeAppointment(id: string): boolean {
  return deleteAppointment(id);
}
