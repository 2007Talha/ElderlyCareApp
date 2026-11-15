/** Generates a short random alphanumeric identifier. */
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/** Returns the current ISO 8601 timestamp string. */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Derives standard dosage times from frequency text.
 * @param frequency Frequency string such as "Once daily", "Twice daily", etc.
 * @returns Array of 24h formatted time strings.
 */
export function deriveScheduledTimes(frequency: string): string[] {
  const lower = frequency.toLowerCase();
  if (lower.includes('four') || lower.includes('qid') || lower.includes('4x')) {
    return ['08:00', '12:00', '16:00', '20:00'];
  }
  if (lower.includes('three') || lower.includes('tid') || lower.includes('3x')) {
    return ['08:00', '13:00', '20:00'];
  }
  if (lower.includes('twice') || lower.includes('bid') || lower.includes('2x')) {
    return ['08:00', '20:00'];
  }
  if (lower.includes('bedtime') || lower.includes('night') || lower.includes('evening')) {
    return ['21:00'];
  }
  return ['08:00'];
}
