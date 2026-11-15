/**
 * Smart Care Assistant and contextual decision engine.
 * Evaluates user context to surface proactive recommendations.
 * Uses Gemini AI when available with deterministic fallback.
 */
import type { AssistantMessage, PrescriptionScanResult } from '@/types';
import { AI_CONFIG } from '@/config/constants';
import { getMedications, getAppointments } from '@/store/dataStore';
import { getAdherenceRecords } from '@/store/dataStore';
import { checkLowInventory } from './drugInteractionService';
import { computeAdherenceRate } from './adherenceTrackerService';
import { nowISO } from '@/utils/helpers';

/** Builds a contextual summary of the user's current health state. */
export function buildContextSummary(): string {
  const meds = getMedications().filter((m) => m.isActive);
  const adherence = getAdherenceRecords();
  const rate = computeAdherenceRate(adherence);
  const lowStock = checkLowInventory();
  const upcoming = getAppointments().filter(
    (a) => new Date(a.appointmentDateTime).getTime() > Date.now()
  );
  const parts: string[] = [
    `Active medications: ${meds.map((m) => m.medicationName).join(', ')}`,
    `Adherence rate: ${rate}%`,
    `Low inventory alerts: ${lowStock.map((m) => `${m.medicationName} (${m.inventoryCount} left)`).join(', ') || 'None'}`,
    `Upcoming appointments: ${upcoming.length}`,
  ];
  return parts.join('\n');
}

/** Generates a contextual response using Gemini or fallback logic. */
export async function generateAssistantResponse(
  userMessage: string, userRole: string
): Promise<AssistantMessage> {
  const context = buildContextSummary();
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);

  if (hasApiKey) {
    return callGeminiApi(userMessage, context, userRole);
  }
  return generateFallbackResponse(userMessage, context, userRole);
}

/** Calls the Gemini API with context and timeout protection. */
async function callGeminiApi(
  message: string, context: string, role: string
): Promise<AssistantMessage> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(), AI_CONFIG.TIMEOUT_MS
    );
    const prompt = `${AI_CONFIG.SYSTEM_PROMPT}\n\nUser Role: ${role}\nHealth Context:\n${context}\n\nUser: ${message}`;
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.MODEL_NAME}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: AI_CONFIG.MAX_TOKENS },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { role: 'assistant', content: text, timestamp: nowISO() };
  } catch {
    return generateFallbackResponse(message, context, role);
  }
}

/** Deterministic fallback when Gemini is unavailable. */
function generateFallbackResponse(
  message: string, context: string, _role: string
): AssistantMessage {
  const lower = message.toLowerCase();
  let content: string;

  if (lower.includes('miss') || lower.includes('forgot')) {
    content = `I noticed some concerns:\n${context}\n\nIf you missed a dose, please take it as soon as possible unless it's close to the next scheduled time. Consult your doctor for guidance.`;
  } else if (lower.includes('medication') || lower.includes('pill')) {
    content = `Based on your profile:\n${context}\n\nI recommend reviewing your medication schedule and ensuring all doses are taken on time.`;
  } else if (lower.includes('appointment')) {
    content = `Here's your health context:\n${context}\n\nPlease check your upcoming appointments and prepare any required documents.`;
  } else {
    content = `Here's your current health overview:\n${context}\n\nHow can I help you further with your care management?`;
  }
  return { role: 'assistant', content, timestamp: nowISO() };
}

/** Parses a prescription label using Gemini Vision or fallback. */
export async function scanPrescriptionLabel(
  imageBase64: string
): Promise<PrescriptionScanResult> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGeminiVision(imageBase64);
    } catch {
      return fallbackPrescriptionParse();
    }
  }
  return fallbackPrescriptionParse();
}

/** Calls Gemini Vision API for prescription label analysis. */
async function callGeminiVision(
  imageBase64: string
): Promise<PrescriptionScanResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.MODEL_NAME}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: AI_CONFIG.SCAN_PROMPT },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          ],
        }],
        generationConfig: { maxOutputTokens: AI_CONFIG.MAX_TOKENS },
      }),
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(cleaned) as PrescriptionScanResult;
}

/** Deterministic fallback prescription parse for demo/offline mode. */
function fallbackPrescriptionParse(): PrescriptionScanResult {
  return {
    medicationName: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    instructions: 'Take in the morning with water.',
  };
}
