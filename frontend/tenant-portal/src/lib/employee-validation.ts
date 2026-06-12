// Single source for employee field-format patterns, so the create and edit forms
// (and any future caller) validate identically and can't drift. Mirrors the backend
// (CreateEmployeeRequest / UpdateEmployeeRequest @Pattern).

/** Kenyan mobile: +2547######## or 07########. */
export const PHONE_RE = /^(\+254|0)7\d{8}$/;

/** National ID: 6–10 digits. */
export const NATIONAL_RE = /^\d{6,10}$/;

/** KRA PIN: one uppercase letter, 9 digits, one uppercase letter (e.g. A123456789X). */
export const KRA_RE = /^[A-Z]\d{9}[A-Z]$/;

/** Shared message so create and edit show the same guidance. */
export const KRA_PIN_MESSAGE =
  "Format: one uppercase letter, 9 digits, one uppercase letter (e.g. A123456789X)";
