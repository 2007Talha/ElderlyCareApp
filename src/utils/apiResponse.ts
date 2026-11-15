import type { ApiResponse } from '@/types';

/** Wraps a successful result in a standard API response. */
export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

/** Wraps an error message in a standard API response. */
export function errorResponse(error: string): ApiResponse<null> {
  return { success: false, data: null, error };
}
