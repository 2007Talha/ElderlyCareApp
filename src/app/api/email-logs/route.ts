/**
 * GET /api/email-logs — Fetch email dispatch telemetry log entries.
 */
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getEmailLogs } from '@/store/dataStore';

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(successResponse(getEmailLogs()));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to fetch email logs.'), { status: 500 }
    );
  }
}
