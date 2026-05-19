/**
 * Registry of known platform feature flags.
 *
 * Each entry here gets a named toggle row in the tenant detail feature-flags
 * section. Flags that exist in the database for a tenant but are NOT in this
 * registry are still displayed as "custom" entries below the registry rows.
 *
 * How to add a flag:
 *   1. Add an entry here with key, label, and description.
 *   2. In the backend service that checks the flag, add:
 *      featureFlagService.isEnabled(tenantId, "your-flag-key")
 *
 * Current status: no feature flags are checked at runtime anywhere in the
 * backend yet. The registry starts empty and will be populated as flags are
 * introduced. This is intentional — the UI is ready before the first flag ships.
 */

export interface KnownFeatureFlag {
  key: string;
  label: string;
  description: string;
}

export const KNOWN_FEATURE_FLAGS: KnownFeatureFlag[] = [
  // No flags in use yet. Add entries here as features are flagged.
  // Example:
  // {
  //   key: "earned-wage-access",
  //   label: "Earned Wage Access",
  //   description: "Enables EWA salary advance requests for employees of this tenant.",
  // },
];
