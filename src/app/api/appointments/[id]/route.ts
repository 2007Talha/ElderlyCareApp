/**
 * GET/PUT/DELETE /api/appointments/[id] — Single appointment operations.
 */
import { NextRequest, NextResponse } from 'next/server';
import { appointmentSchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import {
  findAppointment, editAppointment, removeAppointment,
} from '@/services/appointmentManagerService';

interface RouteContext {
  params: { id: string };
}

export async function GET(
  _request: NextRequest, context: RouteContext
): Promise<NextResponse> {
  try {
    const apt = findAppointment(context.params.id);
    if (!apt) {
      return NextResponse.json(errorResponse('Not found.'), { status: 404 });
    }
    return NextResponse.json(successResponse(apt));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to fetch appointment.'), { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest, context: RouteContext
): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = appointmentSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.errors[0].message), { status: 400 }
      );
    }
    const updated = editAppointment(context.params.id, parsed.data);
    if (!updated) {
      return NextResponse.json(errorResponse('Not found.'), { status: 404 });
    }
    return NextResponse.json(successResponse(updated));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to update appointment.'), { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest, context: RouteContext
): Promise<NextResponse> {
  try {
    const deleted = removeAppointment(context.params.id);
    if (!deleted) {
      return NextResponse.json(errorResponse('Not found.'), { status: 404 });
    }
    return NextResponse.json(successResponse({ deleted: true }));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to delete appointment.'), { status: 500 }
    );
  }
}
