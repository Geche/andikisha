// Shared helpers for rendering React-Query list load-errors consistently.
// Keeps the "what went wrong" message derived from the HTTP status so a 403
// (permission) never reads as a network problem ("check your connection").

/** HTTP status from an axios-style error, if present. */
export function errorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

export function isForbidden(error: unknown): boolean {
  return errorStatus(error) === 403;
}

/**
 * Status-derived load-error message for a list resource.
 * `noun` is the lowercase resource name, e.g. "leave requests".
 */
export function listErrorMessage(error: unknown, noun: string): string {
  switch (errorStatus(error)) {
    case 403:
      return `You don't have permission to view ${noun}. Ask an administrator if you need access.`;
    case 401:
      return "Your session has expired. Please sign in again.";
    default:
      return `Could not load ${noun}. Please try again.`;
  }
}
