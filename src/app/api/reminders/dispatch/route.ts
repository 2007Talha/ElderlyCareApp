/**
 * POST /api/reminders/dispatch — Trigger proactive email reminder checks.
 */
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { dispatchAllReminders } from '@/services/emailReminderService';

export async function POST(): Promise<NextResponse> {
  try {
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
