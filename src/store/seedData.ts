import type { Medication, Appointment, AdherenceRecord, EcosystemActivity } from '@/types';

/** Pre-seeded ecosystem activity timeline for cross-role collaboration. */
export const SEED_ACTIVITIES: EcosystemActivity[] = [
  {
    id: 'act-1', actorRole: 'System', action: 'Proactive Alert Dispatched',
    details: 'Automated monitoring engine dispatched scheduled email notices to Care Circle.',
    timestamp: '15 mins ago', category: 'email',
  },
  {
    id: 'act-2', actorRole: 'Elderly Individual', action: 'Morning Dose Confirmed',
    details: 'Took Metformin HCl 500mg as scheduled with breakfast.',
    timestamp: '45 mins ago', category: 'adherence',
  },
  {
    id: 'act-3', actorRole: 'Caretaker', action: 'Clinical Schedule Review',
    details: 'Caretaker Sarah Jenkins verified inventory refill status for Lisinopril.',
    timestamp: '2 hours ago', category: 'medication',
  },
  {
    id: 'act-4', actorRole: 'Family Member', action: 'Gentle Check-in Sent',
    details: 'Emily Vance sent a check-in: "Thinking of you today! Hope you are hydrated."',
    timestamp: '4 hours ago', category: 'autonomy',
  },
];

/** Realistic pre-seeded medication records for demo. */
export const SEED_MEDICATIONS: Medication[] = [
  {
    id: 'med-001', medicationName: 'Metformin', dosage: '500mg', frequency: 'Twice daily',
    scheduledTimes: ['08:00', '20:00'], inventoryCount: 45,
    instructions: 'Take with meals. Avoid alcohol.', prescribedBy: 'Dr. Sarah Chen',
    isActive: true, createdAt: '2025-10-01T08:00:00Z', updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'med-002', medicationName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily',
    scheduledTimes: ['09:00'], inventoryCount: 22,
    instructions: 'Take in the morning. Monitor blood pressure.', prescribedBy: 'Dr. James Patel',
    isActive: true, createdAt: '2025-09-15T08:00:00Z', updatedAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'med-003', medicationName: 'Warfarin', dosage: '5mg', frequency: 'Once daily',
    scheduledTimes: ['18:00'], inventoryCount: 5,
    instructions: 'Avoid vitamin K-rich foods. Regular INR tests.', prescribedBy: 'Dr. Sarah Chen',
    isActive: true, createdAt: '2025-08-20T08:00:00Z', updatedAt: '2025-08-20T08:00:00Z',
  },
  {
    id: 'med-004',
    medicationName: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily',
    scheduledTimes: ['07:30'],
    inventoryCount: 30,
    instructions: 'Take 30 minutes before breakfast.',
    prescribedBy: 'Dr. Maria Lopez',
    isActive: false,
    createdAt: '2025-07-10T08:00:00Z',
    updatedAt: '2025-11-01T08:00:00Z',
  },
];

/** Realistic pre-seeded appointment records. */
export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    doctorName: 'Dr. Sarah Chen',
    specialty: 'Endocrinology',
    appointmentDateTime: '2026-11-16T10:00:00Z',
    location: 'City Medical Center, Room 204',
    preparationNotes: 'Fasting blood test required. No food after midnight.',
    reminderStatus: 'Pending',
    createdAt: '2025-10-20T08:00:00Z',
    updatedAt: '2025-10-20T08:00:00Z',
  },
  {
    id: 'apt-002',
    doctorName: 'Dr. James Patel',
    specialty: 'Cardiology',
    appointmentDateTime: '2026-11-18T14:30:00Z',
    location: 'Heart Health Clinic, 3rd Floor',
    preparationNotes: 'Bring recent blood pressure logs.',
    reminderStatus: 'Pending',
    createdAt: '2025-10-25T08:00:00Z',
    updatedAt: '2025-10-25T08:00:00Z',
  },
];

/** Pre-seeded adherence history for demo. */
export const SEED_ADHERENCE: AdherenceRecord[] = [
  {
    id: 'adh-001',
    medicationId: 'med-001',
    status: 'Taken',
    scheduledTime: '2026-11-14T08:00:00Z',
    recordedAt: '2026-11-14T08:05:00Z',
    recordedBy: 'Elderly Individual',
    notes: '',
  },
  {
    id: 'adh-002',
    medicationId: 'med-001',
    status: 'Taken',
    scheduledTime: '2026-11-14T20:00:00Z',
    recordedAt: '2026-11-14T20:10:00Z',
    recordedBy: 'Elderly Individual',
    notes: '',
  },
  {
    id: 'adh-003',
    medicationId: 'med-002',
    status: 'Missed',
    scheduledTime: '2026-11-14T09:00:00Z',
    recordedAt: '2026-11-14T12:00:00Z',
    recordedBy: 'Caretaker',
    notes: 'Was at appointment, forgot dose.',
  },
  {
    id: 'adh-004',
    medicationId: 'med-003',
    status: 'Taken',
    scheduledTime: '2026-11-14T18:00:00Z',
    recordedAt: '2026-11-14T18:02:00Z',
    recordedBy: 'Elderly Individual',
    notes: '',
  },
  {
    id: 'adh-005',
    medicationId: 'med-001',
    status: 'Taken',
    scheduledTime: '2026-11-13T08:00:00Z',
    recordedAt: '2026-11-13T08:03:00Z',
    recordedBy: 'Elderly Individual',
    notes: '',
  },
  {
    id: 'adh-006',
    medicationId: 'med-002',
    status: 'Taken',
    scheduledTime: '2026-11-13T09:00:00Z',
    recordedAt: '2026-11-13T09:15:00Z',
    recordedBy: 'Elderly Individual',
    notes: '',
  },
];
