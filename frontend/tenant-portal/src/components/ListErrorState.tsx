"use client";

import { AlertTriangle } from "lucide-react";
import { isForbidden, listErrorMessage } from "@/lib/queryError";

interface ListErrorStateProps {
  error: unknown;
  /** lowercase resource name, e.g. "leave requests" */
  noun: string;
  onRetry?: () => void;
}

/**
 * Single source of truth for list load-error rendering: a status-derived message
 * (no "check your connection" on a 403) with a Retry affordance that is hidden for
 * 403s, where retrying is pointless. Render this *instead of* the table — never
 * alongside an empty state, so the two are mutually exclusive.
 */
export function ListErrorState({ error, noun, onRetry }: ListErrorStateProps) {
  return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
      <AlertTriangle size={15} className="flex-shrink-0" />
      <span className="flex-1">{listErrorMessage(error, noun)}</span>
      {!isForbidden(error) && onRetry && (
        <button
          onClick={onRetry}
          className="text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Retry
        </button>
      )}
    </div>
  );
}
