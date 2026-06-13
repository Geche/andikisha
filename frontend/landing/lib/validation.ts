// Shared validation + abuse-protection helpers for the public form endpoints
// (demo, contact, newsletter) and their client forms. These endpoints are
// unauthenticated and internet-facing, so every value is treated as hostile.

// Stricter than the old `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — requires a real TLD and
// rejects the obvious malformed cases (trailing dot, no TLD) that the loose
// pattern let through.
export const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return email.length <= MAX.email && EMAIL_RE.test(email);
}

// Per-field length caps. Without these a bot can POST a multi-megabyte payload
// that bloats the email and burns the Resend quota.
export const MAX = {
  name: 120,
  email: 254,
  company: 160,
  subject: 120,
  phone: 40,
  employees: 40,
  message: 5000,
} as const;

export function tooLong(value: unknown, max: number): boolean {
  return typeof value === "string" && value.length > max;
}

// Strip CR/LF before interpolating user input into an email subject line, so a
// value like "Acme\nBcc: attacker@evil.com" cannot inject extra headers.
export function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

// Hidden honeypot field shared by every form. Real users never fill it; bots
// that auto-complete every field do. A non-empty value means "drop silently".
export const HONEYPOT_FIELD = "website";

export function isBot(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const trap = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof trap === "string" && trap.trim().length > 0;
}
