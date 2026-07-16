import type { BadgeStatus } from "@andikisha/ui";
import type { LifecycleInstanceStatus, LifecycleTaskStatus } from "@/types/lifecycle";

// ─── Board columns ───────────────────────────────────────────────────────────
// PENDING + IN_PROGRESS collapse into a single "In progress" column.

export interface BoardColumn {
  key: string;
  label: string;
  statuses: LifecycleInstanceStatus[];
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { key: "in-progress", label: "In progress", statuses: ["PENDING", "IN_PROGRESS"] },
  { key: "blocked", label: "Blocked", statuses: ["BLOCKED"] },
  { key: "completed", label: "Completed", statuses: ["COMPLETED"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED"] },
];

// ─── Status → Badge tone ─────────────────────────────────────────────────────

export function instanceBadgeStatus(status: LifecycleInstanceStatus): BadgeStatus {
  switch (status) {
    case "PENDING":     return "pending";
    case "IN_PROGRESS": return "calculating";
    case "BLOCKED":     return "failed";
    case "COMPLETED":   return "approved";
    case "CANCELLED":   return "cancelled";
  }
}

export function instanceStatusLabel(status: LifecycleInstanceStatus): string {
  switch (status) {
    case "PENDING":     return "Pending";
    case "IN_PROGRESS": return "In progress";
    case "BLOCKED":     return "Blocked";
    case "COMPLETED":   return "Completed";
    case "CANCELLED":   return "Cancelled";
  }
}

export function taskBadgeStatus(status: LifecycleTaskStatus): BadgeStatus {
  switch (status) {
    case "OPEN":    return "pending";
    case "DONE":    return "approved";
    case "SKIPPED": return "cancelled";
  }
}

export function taskStatusLabel(status: LifecycleTaskStatus): string {
  switch (status) {
    case "OPEN":    return "Open";
    case "DONE":    return "Done";
    case "SKIPPED": return "Skipped";
  }
}

// ─── Dates ───────────────────────────────────────────────────────────────────

/** Whole days elapsed since an ISO instant, floored at 0. */
export function daysSince(iso: string): number {
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return 0;
  const diffMs = Date.now() - start;
  return Math.max(0, Math.floor(diffMs / 86_400_000));
}

export function daysInStageLabel(iso: string): string {
  const days = daysSince(iso);
  if (days === 0) return "Today";
  return `${days} day${days === 1 ? "" : "s"} in stage`;
}

/** Format a "YYYY-MM-DD" date without UTC drift. */
export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
