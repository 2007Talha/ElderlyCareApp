/**
 * GET/PUT/DELETE /api/medications/[id] — Single medication operations.
 */
import { NextRequest, NextResponse } from 'next/server';
import { medicationSchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import {
  findMedication, editMedication, removeMedication,
} from '@/services/medicationScheduleService';

interface RouteContext {
  params: { id: string };
}

export async function GET(
  _request: NextRequest, context: RouteContext
): Promise<NextResponse> {
  try {
    const med = findMedication(context.params.id);
    if (!med) {
      return NextResponse.json(errorResponse('Not found.'), { status: 404 });
    }
    return NextResponse.json(successResponse(med));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to fetch medication.'), { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest, context: RouteContext
): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = medicationSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.errors[0].message), { status: 400 }
      );
    }
    const updated = editMedication(context.params.id, parsed.data);
    if (!updated) {
      return NextResponse.json(errorResponse('Not found.'), { status: 404 });
    }
    return NextResponse.json(successResponse(updated));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to update medication.'), { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest, context: RouteContext
): Promise<NextResponse> {
  try {
    const deleted = removeMedication(context.params.id);
    if (!deleted) {
      return NextResponse.json(errorResponse('Not found.'), { status: 404 });
    }
    return NextResponse.json(successResponse({ deleted: true }));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to delete medication.'), { status: 500 }
    );
  }
}
