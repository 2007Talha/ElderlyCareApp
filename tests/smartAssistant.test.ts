/**
 * Tests for Smart Care Assistant contextual decision logic and fallbacks.
 */
import { describe, it, expect } from 'vitest';
import {
  buildContextSummary, generateAssistantResponse,
  scanPrescriptionLabel,
} from '@/services/smartCareAssistantService';
import {
  checkInteractions, checkLowInventory, estimateDaysUntilDepletion,
} from '@/services/drugInteractionService';

describe('smartCareAssistantService', () => {
  it('builds a context summary with active medications', () => {
    const summary = buildContextSummary();
    expect(summary).toContain('Active medications');
    expect(summary).toContain('Adherence rate');
  });

  it('generates a fallback response for medication queries', async () => {
    const response = await generateAssistantResponse(
      'Tell me about my medication schedule', 'Elderly Individual'
    );
    expect(response.role).toBe('assistant');
    expect(response.content).toBeTruthy();
    expect(response.content).toContain('medication');
  });

  it('generates a fallback response for appointment queries', async () => {
    const response = await generateAssistantResponse(
      'When is my next appointment?', 'Caretaker'
    );
    expect(response.content).toContain('appointment');
  });

  it('generates a fallback response for missed dose queries', async () => {
    const response = await generateAssistantResponse(
      'I missed my morning pill', 'Elderly Individual'
    );
    expect(response.content).toContain('missed');
  });

  it('generates a generic fallback for unknown queries', async () => {
    const response = await generateAssistantResponse(
      'Hello, how are you?', 'Family Member'
    );
    expect(response.content).toContain('health overview');
  });

  it('returns a deterministic fallback prescription scan', async () => {
    const result = await scanPrescriptionLabel('demo-placeholder');
    expect(result.medicationName).toBe('Amlodipine');
    expect(result.dosage).toBe('5mg');
    expect(result.frequency).toBeTruthy();
  });
});

describe('drugInteractionService', () => {
  it('detects Warfarin + Aspirin interaction', () => {
    const interactions = checkInteractions('Aspirin');
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    expect(interactions[0].severity).toBe('High');
  });

  it('returns empty for a safe medication', () => {
    const interactions = checkInteractions('Vitamin D');
    expect(interactions).toHaveLength(0);
  });

  it('identifies low inventory medications', () => {
    const low = checkLowInventory();
    expect(Array.isArray(low)).toBe(true);
    const warfarin = low.find((m) => m.medicationName === 'Warfarin');
    expect(warfarin).toBeTruthy();
  });

  it('estimates days until depletion', () => {
    const med = {
      id: 'test', medicationName: 'Test', dosage: '5mg',
      frequency: 'Twice daily', scheduledTimes: ['08:00', '20:00'],
      inventoryCount: 20, instructions: '', prescribedBy: 'Dr. T',
      isActive: true, createdAt: '', updatedAt: '',
    };
    expect(estimateDaysUntilDepletion(med)).toBe(10);
  });
});
