/**
 * POST /api/assistant — Smart Care Assistant contextual query with security & cache guardrails.
 */
import { NextRequest, NextResponse } from 'next/server';
import { assistantQuerySchema } from '@/utils/validationSchemas';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { generateAssistantResponse } from '@/services/smartCareAssistantService';
import { sanitizeInput } from '@/lib/security/sanitizer';
import { analyzePromptSafety } from '@/lib/security/promptGuard';
import { redactPii } from '@/lib/security/piiRedactor';
import { assistantResponseCache } from '@/lib/efficiency/responseCache';
import { nowISO } from '@/utils/helpers';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const start = Date.now();
  try {
    const body: unknown = await request.json();
    const parsed = assistantQuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(errorResponse(parsed.error.errors[0].message), { status: 400 });
    }

    const clean = sanitizeInput(parsed.data.message);
    const safety = analyzePromptSafety(clean);
    if (!safety.isSafe) {
      return NextResponse.json(successResponse({
        role: 'assistant',
        content: 'Security Alert: Prompt override pattern detected. Request neutralized for safety.',
        timestamp: nowISO(),
        telemetry: {
          source: 'deterministic', cacheHit: false, latencyMs: Date.now() - start,
          piiTokensRedacted: 0, promptInjectionBlocked: true, inputSanitized: true, schemaValid: true,
        },
      }));
    }

    const pii = redactPii(clean);
    const cacheKey = { query: pii.redactedText, role: parsed.data.role };
    const cached = assistantResponseCache.get(cacheKey);

    if (cached) {
      return NextResponse.json(successResponse({
        role: 'assistant', content: cached, timestamp: nowISO(),
        telemetry: {
          source: 'cache', cacheHit: true, latencyMs: Date.now() - start,
          piiTokensRedacted: pii.redactedCount, promptInjectionBlocked: false, inputSanitized: true, schemaValid: true,
        },
      }));
    }

    const resp = await generateAssistantResponse(pii.redactedText, parsed.data.role);
    assistantResponseCache.set(cacheKey, resp.content);

    return NextResponse.json(successResponse({
      ...resp,
      telemetry: {
        source: process.env.GEMINI_API_KEY ? 'gemini' : 'deterministic',
        cacheHit: false, latencyMs: Date.now() - start,
        piiTokensRedacted: pii.redactedCount, promptInjectionBlocked: false, inputSanitized: true, schemaValid: true,
      },
    }));
  } catch {
    return NextResponse.json(errorResponse('Assistant query failed.'), { status: 500 });
  }
}
