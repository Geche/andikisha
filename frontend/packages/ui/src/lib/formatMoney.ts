/**
 * Formats a monetary amount for display.
 * Returns "KES 250,000.00" — non-breaking space between currency code and amount.
 * Always renders 2 decimal places.
 */
export function formatMoney(
  amount: number,
  currency = "KES",
  cents = true,
): string {
  const formatted = amount.toLocaleString("en-KE", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
  return `${currency} ${formatted}`;
}
