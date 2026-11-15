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
