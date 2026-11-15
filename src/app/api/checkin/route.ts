/**
 * GET/POST/PUT /api/checkin — Caretaker check-in requests & elderly confirmation.
 */
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getCheckInAlert, setCheckInAlert, addEmailLog } from '@/store/dataStore';
import { generateId, nowISO } from '@/utils/helpers';
import type { EmailDispatchLog } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(successResponse(getCheckInAlert()));
  } catch {
    return NextResponse.json(errorResponse('Failed to fetch check-in status.'), { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json().catch(() => ({}))) as { message?: string; requestedBy?: string };
    const now = nowISO();
    const alertId = `chk-${generateId()}`;
    const alert = {
      id: alertId,
      requestedAt: now,
      message: body.message || 'Caretaker requested immediate wellness confirmation.',
      acknowledged: false,
    };
    setCheckInAlert(alert);

    const elderlyEmail: EmailDispatchLog = {
      id: `email-${generateId()}`,
      recipient: process.env.ELDERLY_EMAIL ?? 'elderly@example.com',
      subject: 'URGENT: Caretaker Care Check-in Request',
      triggerReason: 'Caretaker Care Check-in',
      timestamp: now,
      deliveryStatus: 'Delivered',
      body: 'Your caretaker has requested an immediate wellness confirmation. Please open your dashboard and confirm you are safe.',
    };
    addEmailLog(elderlyEmail);

    return NextResponse.json(successResponse({ alert, dispatched: true }), { status: 201 });
  } catch {
    return NextResponse.json(errorResponse('Failed to trigger check-in.'), { status: 500 });
  }
}

export async function PUT(): Promise<NextResponse> {
  try {
    const current = getCheckInAlert();
    if (!current) {
      return NextResponse.json(errorResponse('No active check-in request.'), { status: 404 });
    }
    const now = nowISO();
    setCheckInAlert(null);

    const confirmationEmail: EmailDispatchLog = {
      id: `email-${generateId()}`,
      recipient: process.env.CARETAKER_EMAIL ?? 'caretaker@example.com',
      subject: 'CONFIRMED: Elderly Individual is Safe & OK',
      triggerReason: 'Caretaker Care Check-in',
      timestamp: now,
      deliveryStatus: 'Delivered',
      body: 'The elderly individual has confirmed their safety and wellness on their dashboard.',
    };
    addEmailLog(confirmationEmail);

    return NextResponse.json(successResponse({ acknowledged: true }));
  } catch {
    return NextResponse.json(errorResponse('Failed to confirm check-in.'), { status: 500 });
  }
}
