/**
 * GET /api/consent — Fetch consent preferences.
 * PUT /api/consent — Update consent preferences.
 */
import { NextRequest, NextResponse } from 'next/server';
import { consentSchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getConsent, setConsent } from '@/store/dataStore';

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(successResponse(getConsent()));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to fetch consent.'), { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = consentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.errors[0].message), { status: 400 }
      );
    }
    setConsent(parsed.data);
    return NextResponse.json(successResponse(parsed.data));
  } catch {
    return NextResponse.json(
      errorResponse('Failed to update consent.'), { status: 500 }
    );
  }
}
