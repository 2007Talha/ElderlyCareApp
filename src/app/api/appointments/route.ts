/**
 * GET /api/appointments — List all appointments.
 * POST /api/appointments — Create a new appointment.
 */
import { NextRequest, NextResponse } from 'next/server';
import { appointmentSchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import {
  listAppointments, createAppointment,
} from '@/services/appointmentManagerService';

export async function GET(): Promise<NextResponse> {
  try {
    const appointments = listAppointments();
    return NextResponse.json(
      successResponse(appointments), { status: 200 }
    );
  } catch {
    return NextResponse.json(
      errorResponse('Failed to fetch appointments.'), { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.errors[0].message), { status: 400 }
      );
    }
    const appointment = createAppointment(parsed.data);
    return NextResponse.json(
      successResponse(appointment), { status: 201 }
    );
  } catch {
    return NextResponse.json(
      errorResponse('Failed to create appointment.'), { status: 500 }
    );
  }
}
