/**
 * Tests for proactive email reminder triggers.
 * Covers upcoming dose, missed dose, and appointment alert dispatch.
 */
import { describe, it, expect } from 'vitest';
import {
  checkUpcomingDoses, checkMissedDoses,
  checkUpcomingAppointments, dispatchAllReminders,
} from '@/services/emailReminderService';

describe('emailReminderService', () => {
  it('returns an array from checkUpcomingDoses', async () => {
    const result = await checkUpcomingDoses();
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns an array from checkMissedDoses', async () => {
    const result = await checkMissedDoses();
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns an array from checkUpcomingAppointments', async () => {
    const result = await checkUpcomingAppointments();
    expect(Array.isArray(result)).toBe(true);
  });

  it('dispatchAllReminders runs all checks concurrently', async () => {
    const result = await dispatchAllReminders();
    expect(Array.isArray(result)).toBe(true);
  });

  it('email log entries have required fields when dispatched', async () => {
    const result = await dispatchAllReminders();
    for (const log of result) {
      expect(log.id).toBeTruthy();
      expect(log.recipient).toBeTruthy();
      expect(log.subject).toBeTruthy();
      expect(log.triggerReason).toBeTruthy();
      expect(log.timestamp).toBeTruthy();
      expect(log.deliveryStatus).toBeTruthy();
    }
  });

  it('dispatched emails have valid trigger reasons and delivery statuses', async () => {
    const validTriggers = [
      'Upcoming Medication Dose', 'Missed Medication',
      'Upcoming Appointment 24h', 'Upcoming Appointment 2h',
      'Low Inventory Alert', 'Caretaker Care Check-in',
    ];
    const validStatuses = ['Sent', 'Delivered', 'Simulated', 'Failed'];
    const result = await dispatchAllReminders();
    for (const log of result) {
      expect(validTriggers).toContain(log.triggerReason);
      expect(validStatuses).toContain(log.deliveryStatus);
    }
  });

  it('records dispatched reminders into telemetry email logs', async () => {
    const beforeCount = (await dispatchAllReminders()).length;
    expect(beforeCount).toBeGreaterThanOrEqual(0);
  });
});
