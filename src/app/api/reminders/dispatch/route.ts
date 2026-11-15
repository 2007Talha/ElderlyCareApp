/**
 * POST /api/reminders/dispatch — Trigger proactive email reminder checks or judge simulations.
 */
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { dispatchAllReminders } from '@/services/emailReminderService';
import { simulateMissedDoseAlert, simulateUpcomingDoseAlert } from '@/services/reminderSimulatorService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const simulate = url.searchParams.get('simulate');

    if (simulate === 'missed') {
      const log = simulateMissedDoseAlert();
      return NextResponse.json(successResponse({ dispatched: 1, logs: [log] }), { status: 200 });
    }

    if (simulate === 'upcoming') {
      const log = simulateUpcomingDoseAlert();
      return NextResponse.json(successResponse({ dispatched: 1, logs: [log] }), { status: 200 });
    }

    const dispatched = await dispatchAllReminders();
    return NextResponse.json(
      successResponse({
        dispatched: dispatched.length,
        logs: dispatched,
      }),
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      errorResponse('Failed to dispatch reminders.'),
      { status: 500 }
    );
  }
}
