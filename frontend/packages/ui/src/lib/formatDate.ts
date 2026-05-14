const NAIROBI = "Africa/Nairobi";

/**
 * Formats a date as "13 May 2026" (dd MMM yyyy) in Africa/Nairobi timezone.
 * Accepts a Date object, ISO string, or any value accepted by new Date().
 */
export function formatDate(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: NAIROBI,
  }).format(d);
}

/**
 * Formats a time as "14:30" (HH:mm, 24-hour) in Africa/Nairobi timezone,
 * regardless of the user's browser locale or timezone.
 */
export function formatTime(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: NAIROBI,
  }).format(d);
}
