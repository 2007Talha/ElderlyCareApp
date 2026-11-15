/**
 * GET /api/medications — List all medications.
 * POST /api/medications — Create a new medication.
 */
import { NextRequest, NextResponse } from 'next/server';
import { medicationSchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import {
  listMedications, createMedication,
} from '@/services/medicationScheduleService';
import { checkInteractions, checkLowInventory } from '@/services/drugInteractionService';

export async function GET(): Promise<NextResponse> {
  try {
    const medications = listMedications();
    const lowInventory = checkLowInventory();
    return NextResponse.json(
      successResponse({ medications, lowInventory }),
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      errorResponse('Failed to fetch medications.'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = medicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.errors[0].message),
        { status: 400 }
      );
    }

    const interactions = checkInteractions(parsed.data.medicationName);
    const medication = createMedication(parsed.data);
    return NextResponse.json(
      successResponse({ medication, interactions }),
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      errorResponse('Failed to create medication.'),
      { status: 500 }
    );
  }
}
