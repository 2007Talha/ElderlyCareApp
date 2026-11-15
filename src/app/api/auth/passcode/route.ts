/**
 * POST /api/auth/passcode — Authenticate via passcode with role selection.
 */
import { NextRequest, NextResponse } from 'next/server';
import { passcodeLoginSchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import {
  isRateLimited, recordFailedAttempt,
  validatePasscode, createSession,
} from '@/services/passcodeAuthService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ipKey = request.headers.get('x-forwarded-for') ?? 'local';
    if (isRateLimited(ipKey)) {
      return NextResponse.json(
        errorResponse('Too many attempts. Please try again later.'),
        { status: 429 }
      );
    }

    const body: unknown = await request.json();
    const parsed = passcodeLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.errors[0].message),
        { status: 400 }
      );
    }

    if (!validatePasscode(parsed.data.passcode)) {
      recordFailedAttempt(ipKey);
      return NextResponse.json(
        errorResponse('Invalid passcode.'),
        { status: 401 }
      );
    }

    const session = createSession(parsed.data.role);
    return NextResponse.json(successResponse(session), { status: 200 });
  } catch {
    return NextResponse.json(
      errorResponse('Authentication failed.'),
      { status: 500 }
    );
  }
}
