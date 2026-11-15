/**
 * POST /api/reset — Restores in-memory and demo state back to default seed state.
 */
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { resetDataStore } from '@/store/dataStore';

export async function POST(): Promise<NextResponse> {
  try {
    resetDataStore();
    return NextResponse.json(
      successResponse({ message: 'Demo data restored successfully to initial seed state.' }),
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      errorResponse('Failed to reset demo state.'),
      { status: 500 }
    );
  }
}
