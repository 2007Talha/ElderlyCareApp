/**
 * Medical appointments manager service.
 * Full CRUD for upcoming doctor appointments.
 */
import type { Appointment } from '@/types';
import type { AppointmentInput } from '@/utils/validationSchemas';
import {
  getAppointments, getAppointmentById,
  addAppointment, updateAppointment, deleteAppointment,
} from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';

/** Returns all appointment records. */
export function listAppointments(): Appointment[] {
  return getAppointments();
}

/** Returns only future appointments sorted by date ascending. */
export function listUpcomingAppointments(): Appointment[] {
  const now = Date.now();
  return getAppointments()
    .filter((a) => new Date(a.appointmentDateTime).getTime() > now)
    .sort((a, b) =>
      new Date(a.appointmentDateTime).getTime() -
      new Date(b.appointmentDateTime).getTime()
    );
}

/** Finds a single appointment by id. */
export function findAppointment(id: string): Appointment | undefined {
  return getAppointmentById(id);
}

/** Creates a new appointment from validated input. */
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

/** Updates an existing appointment by id. */
export function editAppointment(
  id: string,
  input: Partial<AppointmentInput>
): Appointment | undefined {
  return updateAppointment(id, { ...input, updatedAt: nowISO() });
}

/** Removes an appointment by id. */
export function removeAppointment(id: string): boolean {
  return deleteAppointment(id);
}
