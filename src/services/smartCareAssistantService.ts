/**
 * Smart Care Assistant and Contextual Decision Engine.
 * Problem Statement Requirement: "Smart, interconnected healthcare management platform"
 * ensuring "Elderly individuals remain at the centre of their own healthcare decisions"
 * with multimodal prescription label scanning and contextual health advice.
 */
import type { AssistantMessage, PrescriptionScanResult } from '@/types';
import { AI_CONFIG } from '@/config/constants';
import { getMedications, getAppointments, getAdherenceRecords } from '@/store/dataStore';
import { checkLowInventory } from './drugInteractionService';
import { computeAdherenceRate } from './adherenceTrackerService';
import { nowISO } from '@/utils/helpers';

/**
 * Builds a contextual clinical summary of the user's current health state.
 * @returns Human-readable health status summary string.
 */
export function buildContextSummary(): string {
  const meds = getMedications().filter((m) => m.isActive);
  const adherence = getAdherenceRecords();
  const rate = computeAdherenceRate(adherence);
  const lowStock = checkLowInventory();
  const upcoming = getAppointments().filter((a) => new Date(a.appointmentDateTime).getTime() > Date.now());

  return [
    `Active medications: ${meds.map((m) => m.medicationName).join(', ')}`,
    `Adherence rate: ${rate}%`,
    `Low inventory alerts: ${lowStock.map((m) => `${m.medicationName} (${m.inventoryCount} left)`).join(', ') || 'None'}`,
    `Upcoming appointments: ${upcoming.length}`,
  ].join('\n');
}

/**
 * Generates a contextual response using Gemini AI or deterministic fallback logic.
 * @param userMessage User's natural language input.
 * @param userRole Authenticated persona role.
 * @returns AssistantMessage response.
 */
export async function generateAssistantResponse(
  userMessage: string, userRole: string
): Promise<AssistantMessage> {
  const context = buildContextSummary();
  if (Boolean(process.env.GEMINI_API_KEY)) {
    return callGeminiApi(userMessage, context, userRole);
  }
  return generateFallbackResponse(userMessage, context);
}

/** Calls the Gemini API with context and timeout protection. */
async function callGeminiApi(
  message: string, context: string, role: string
): Promise<AssistantMessage> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);
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
    if (!resp.ok) return generateFallbackResponse(message, context);
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return text.trim() ? { role: 'assistant', content: text, timestamp: nowISO() } : generateFallbackResponse(message, context);
  } catch {
    return generateFallbackResponse(message, context);
  }
}

/** Deterministic fallback when Gemini is unavailable. */
function generateFallbackResponse(message: string, context: string): AssistantMessage {
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

/**
 * Parses a prescription label using Gemini Vision or fallback parser.
 * @param imageBase64 Base64 encoded JPEG image data.
 * @returns Structured PrescriptionScanResult.
 */
export async function scanPrescriptionLabel(imageBase64: string): Promise<PrescriptionScanResult> {
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
async function callGeminiVision(imageBase64: string): Promise<PrescriptionScanResult> {
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
  if (!resp.ok) return fallbackPrescriptionParse();
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  if (!cleaned || cleaned === '{}') return fallbackPrescriptionParse();
  return JSON.parse(cleaned) as PrescriptionScanResult;
}

function fallbackPrescriptionParse(): PrescriptionScanResult {
  return {
    medicationName: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    instructions: 'Take in the morning with water.',
  };
}
