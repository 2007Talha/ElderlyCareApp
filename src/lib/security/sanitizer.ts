/**
 * XSS and control-character sanitization for user inputs.
 * Strips script tags, iframes, javascript protocols, and non-printable chars.
 */

const DANGEROUS_PATTERNS: RegExp[] = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<\s*embed\b/gi,
  /<\s*object\b/gi,
];

const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const MAX_INPUT_LENGTH = 5000;

/** Sanitizes a single input string against XSS and control characters. */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  let clean = input.replace(CONTROL_CHAR_REGEX, '');
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  clean = clean.replace(/\s{10,}/g, ' ').trim();
  return clean.length > MAX_INPUT_LENGTH ? clean.substring(0, MAX_INPUT_LENGTH) : clean;
}

/** Recursively sanitizes all string values within an object. */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => (typeof item === 'string' ? sanitizeInput(item) : item));
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
