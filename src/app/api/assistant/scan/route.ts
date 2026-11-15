/**
 * POST /api/assistant/scan — Multimodal prescription label scanner endpoint.
 */
import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { scanPrescriptionLabel } from '@/services/smartCareAssistantService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      image?: string;
      filename?: string;
      mimeType?: string;
    };
    if (!body.image) {
      return NextResponse.json(
        errorResponse('Image data is required for prescription analysis.'),
        { status: 400 }
      );
    }
    const result = await scanPrescriptionLabel(body.image, body.filename, body.mimeType);
    return NextResponse.json(successResponse(result), { status: 200 });
  } catch {
    return NextResponse.json(
      errorResponse('Prescription scan analysis failed.'),
      { status: 500 }
    );
  }
}
