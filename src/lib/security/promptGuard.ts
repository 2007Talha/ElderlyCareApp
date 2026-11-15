/**
 * Prompt injection and jailbreak detection engine.
 * Guards the Smart Care Assistant against malicious prompt attacks.
 */

export interface PromptGuardResult {
  isSafe: boolean;
  injectionDetected: boolean;
  triggeredPatterns: string[];
  riskScore: number;
}

interface InjectionRule {
  pattern: RegExp;
  description: string;
  weight: number;
}

const INJECTION_PATTERNS: readonly InjectionRule[] = [
  { pattern: /ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)/i, description: 'Instruction override', weight: 1.0 },
  { pattern: /disregard\s+(all\s+)?prior\s+(instructions|context|rules)/i, description: 'Context disregard', weight: 1.0 },
  { pattern: /forget\s+(everything|all|your)\s*(instructions|rules)?/i, description: 'Memory reset', weight: 0.9 },
  { pattern: /you\s+are\s+now\s+(a|an|the)\s+/i, description: 'Role spoofing', weight: 0.8 },
  { pattern: /system\s*:\s*/i, description: 'System prompt injection', weight: 1.0 },
  { pattern: /\[INST\]|\[\/INST\]|<<SYS>>|<\|im_start\|>/i, description: 'Template injection', weight: 1.0 },
  { pattern: /output\s+(your|the)\s+(system\s+)?prompt/i, description: 'Prompt extraction', weight: 0.9 },
  { pattern: /bypass\s+(safety|content|security)/i, description: 'Safety bypass', weight: 1.0 },
  { pattern: /\bDAN\s+mode\b|\bdo\s+anything\s+now\b/i, description: 'DAN mode jailbreak', weight: 1.0 },
  { pattern: /sudo\s+(mode|access|prompt)/i, description: 'Privilege escalation', weight: 0.8 },
];

const RISK_THRESHOLD = 0.5;

/** Analyzes input text for adversarial prompt injection attempts. */
export function analyzePromptSafety(input: string): PromptGuardResult {
  if (!input || typeof input !== 'string') {
    return { isSafe: true, injectionDetected: false, triggeredPatterns: [], riskScore: 0 };
  }

  const triggeredPatterns: string[] = [];
  let maxWeight = 0;
  let totalWeight = 0;

  for (const { pattern, description, weight } of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      triggeredPatterns.push(description);
      totalWeight += weight;
      maxWeight = Math.max(maxWeight, weight);
    }
  }

  const riskScore = Math.min(1, maxWeight + (totalWeight - maxWeight) * 0.1);
  const injectionDetected = riskScore >= RISK_THRESHOLD;

  return { isSafe: !injectionDetected, injectionDetected, triggeredPatterns, riskScore };
}

/** Quick boolean check whether an assistant prompt is safe to process. */
export function isPromptSafe(input: string): boolean {
  return analyzePromptSafety(input).isSafe;
}
