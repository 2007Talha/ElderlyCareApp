/**
 * Tests for UI Design System helpers, pill shape deduction,
 * timeline time slot categorization, and check-in alert state.
 */
import { describe, it, expect } from 'vitest';
import { deducePillShape } from '@/components/ui/PillShapeIcon';
import { getTimeSlot } from '@/components/medications/ScheduleTimelineIcon';
import { getCheckInAlert, setCheckInAlert } from '@/store/dataStore';

describe('Pill Shape Deduction', () => {
  it('deduces liquid-drop for syrups, drops and liquids', () => {
    expect(deducePillShape('Cough Syrup')).toBe('liquid-drop');
    expect(deducePillShape('Eye Drops')).toBe('liquid-drop');
    expect(deducePillShape('Liquid Vitamin D')).toBe('liquid-drop');
  });

  it('deduces capsule for capsules', () => {
    expect(deducePillShape('Omeprazole 20mg Capsule')).toBe('capsule');
    expect(deducePillShape('Antibiotic Cap')).toBe('capsule');
  });

  it('deduces oval-caplet for high dose or caplet forms', () => {
    expect(deducePillShape('Metformin 500mg')).toBe('oval-caplet');
    expect(deducePillShape('Tylenol Caplet')).toBe('oval-caplet');
  });

  it('defaults to round-tablet for other medications', () => {
    expect(deducePillShape('Lisinopril 10mg')).toBe('round-tablet');
    expect(deducePillShape('Warfarin 5mg')).toBe('round-tablet');
    expect(deducePillShape('')).toBe('round-tablet');
  });
});

describe('Schedule Timeline Categorization', () => {
  it('categorizes times before 12:00 as Morning', () => {
    const morning = getTimeSlot('08:00');
    expect(morning.slot).toBe('Morning');
    expect(morning.color).toContain('amber');
  });

  it('categorizes times between 12:00 and 17:59 as Afternoon', () => {
    const afternoon = getTimeSlot('14:30');
    expect(afternoon.slot).toBe('Afternoon');
    expect(afternoon.color).toContain('sky');
  });

  it('categorizes times 18:00 and later as Night', () => {
    const night = getTimeSlot('20:00');
    expect(night.slot).toBe('Night');
    expect(night.color).toContain('indigo');
  });

  it('handles edge cases gracefully', () => {
    expect(getTimeSlot('').slot).toBe('Morning');
    expect(getTimeSlot('12:00').slot).toBe('Afternoon');
    expect(getTimeSlot('18:00').slot).toBe('Night');
  });
});

describe('Care Check-in State Management', () => {
  it('starts with null or allows setting active check-in', () => {
    setCheckInAlert(null);
    expect(getCheckInAlert()).toBeNull();

    setCheckInAlert({
      id: 'test-chk',
      requestedAt: new Date().toISOString(),
      message: 'Urgent check-in',
      acknowledged: false,
    });
    const current = getCheckInAlert();
    expect(current).not.toBeNull();
    expect(current?.message).toBe('Urgent check-in');

    setCheckInAlert(null);
    expect(getCheckInAlert()).toBeNull();
  });

  it('supports caretaker and family custom reminder alerts', () => {
    setCheckInAlert({
      id: 'fam-chk-1',
      requestedAt: new Date().toISOString(),
      message: 'Thinking of you! Remember your evening pills with dinner ❤️',
      acknowledged: false,
    });
    const current = getCheckInAlert();
    expect(current?.message).toContain('dinner');
    expect(current?.acknowledged).toBe(false);
    setCheckInAlert(null);
  });
});
