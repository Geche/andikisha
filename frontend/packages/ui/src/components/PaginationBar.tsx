"use client";

import { cn } from "../utils";

const PAGE_SIZES = [10, 25, 50] as const;

export interface PaginationBarProps {
  /** Zero-based current page index. */
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  /** Label for the item type, e.g. "employees". Defaults to "items". */
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  itemLabel = "items",
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationBarProps) {
  if (totalPages <= 1 && totalCount <= PAGE_SIZES[0]) return null;

  return (
    <div className={cn("flex items-center justify-between gap-4 text-[13px]", className)}>
      <p className="text-neutral-500 whitespace-nowrap">
        Page {currentPage + 1} of {totalPages} · {totalCount.toLocaleString()} {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        {/* Page-size selector */}
        <div className="flex items-center gap-1.5 text-[12.5px] text-neutral-500">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(0);
            }}
            className="border border-neutral-200 rounded-lg px-2 py-1.5 text-[12.5px] text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 cursor-pointer"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <button
          disabled={currentPage === 0}
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          className="px-3.5 py-2 border border-neutral-200 rounded-lg font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3.5 py-2 border border-neutral-200 rounded-lg font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
