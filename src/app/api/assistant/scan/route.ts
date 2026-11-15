/**
 * POST /api/assistant/scan — Prescription label scanner endpoint.
 */
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { scanPrescriptionLabel } from '@/services/smartCareAssistantService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { image?: string };
    if (!body.image) {
      return NextResponse.json(
        errorResponse('Image data is required.'),
        { status: 400 }
      );
    }
    const result = await scanPrescriptionLabel(body.image);
    return NextResponse.json(successResponse(result), { status: 200 });
  } catch {
    return NextResponse.json(
      errorResponse('Prescription scan failed.'),
      { status: 500 }
    );
  }
}
