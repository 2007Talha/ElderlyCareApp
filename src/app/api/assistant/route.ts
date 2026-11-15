/**
 * POST /api/assistant — Smart Care Assistant contextual query.
 */
import { NextRequest, NextResponse } from 'next/server';
import { assistantQuerySchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { generateAssistantResponse } from '@/services/smartCareAssistantService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = assistantQuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.errors[0].message),
        { status: 400 }
      );
    }
    const response = await generateAssistantResponse(
      parsed.data.message, parsed.data.role
    );
    return NextResponse.json(successResponse(response), { status: 200 });
  } catch {
    return NextResponse.json(
      errorResponse('Assistant query failed.'),
      { status: 500 }
    );
  }
}
