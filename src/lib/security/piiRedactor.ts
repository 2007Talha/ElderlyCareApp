/**
 * PII (Personally Identifiable Information) Redaction Engine.
 * Redacts emails, phone numbers, SSNs, and street addresses before AI analysis.
 */

export interface PiiRedactionResult {
  redactedText: string;
  redactedCount: number;
  details: { emails: number; phones: number; ssns: number; addresses: number };
}

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g;
const ADDRESS_REGEX = /\b\d{1,5}\s+(?:[A-Za-z]+\s){1,4}(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd|Lane|Ln|Boulevard|Blvd)\b\.?/gi;

/** Redacts sensitive PII from user text to protect elderly privacy. */
export function redactPii(text: string): PiiRedactionResult {
  if (!text || typeof text !== 'string') {
    return { redactedText: '', redactedCount: 0, details: { emails: 0, phones: 0, ssns: 0, addresses: 0 } };
  }

  let redacted = text;
  const details = { emails: 0, phones: 0, ssns: 0, addresses: 0 };

  redacted = redacted.replace(EMAIL_REGEX, () => {
    details.emails++;
    return '[EMAIL_REDACTED]';
  });

  redacted = redacted.replace(SSN_REGEX, (match) => {
    const digits = match.replace(/[-\s]/g, '');
    const area = parseInt(digits.substring(0, 3), 10);
    if (area === 0 || area === 666 || area >= 900) return match;
    details.ssns++;
    return '[SSN_REDACTED]';
  });

  redacted = redacted.replace(PHONE_REGEX, (match) => {
    if (match.replace(/\D/g, '').length < 7) return match;
    details.phones++;
    return '[PHONE_REDACTED]';
  });

  redacted = redacted.replace(ADDRESS_REGEX, () => {
    details.addresses++;
    return '[ADDRESS_REDACTED]';
  });

  const total = details.emails + details.phones + details.ssns + details.addresses;
  return { redactedText: redacted, redactedCount: total, details };
}

/** Returns true if the text contains any detectable PII tokens. */
export function containsPii(text: string): boolean {
  return redactPii(text).redactedCount > 0;
}
