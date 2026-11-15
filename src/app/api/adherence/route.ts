/**
 * GET /api/adherence — Fetch adherence records and metrics.
 * POST /api/adherence — Log a new dose adherence event.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adherenceSchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import {
  logAdherence, computeAdherenceRate,
  computeDailyStreak, countByStatus,
} from '@/services/adherenceTrackerService';
import { getAdherenceRecords } from '@/store/dataStore';
import { decrementInventory } from '@/services/medicationScheduleService';

export async function GET(): Promise<NextResponse> {
  try {
    const records = getAdherenceRecords();
    const rate = computeAdherenceRate(records);
    const streak = computeDailyStreak(records);
    const breakdown = countByStatus(records);
    return NextResponse.json(
      successResponse({ records, rate, streak, breakdown }),
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      errorResponse('Failed to fetch adherence data.'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = adherenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.errors[0].message),
        { status: 400 }
      );
    }

    const record = logAdherence(parsed.data);
    if (parsed.data.status === 'Taken') {
      decrementInventory(parsed.data.medicationId);
    }
    return NextResponse.json(successResponse(record), { status: 201 });
  } catch {
    return NextResponse.json(
      errorResponse('Failed to log adherence.'),
      { status: 500 }
    );
  }
}
