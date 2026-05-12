"use client";

import type { ReactNode } from "react";
import { cn } from "../utils";
import { Skeleton } from "./Skeleton";

interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, ReactNode>[];
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (row: Record<string, ReactNode>, index: number) => void;
  className?: string;
}

const ALIGN_TH: Record<string, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

const ALIGN_TD: Record<string, string> = {
  left: "text-left",
  right: "text-right tabular-nums font-mono",
  center: "text-center",
};

export function DataTable({
  columns,
  rows,
  emptyMessage = "No data",
  isLoading = false,
  onRowClick,
  className,
}: DataTableProps) {
  const clickable = typeof onRowClick === "function";

  return (
    <div className={cn("bg-surface border border-[#E5E7EB] rounded-xl overflow-hidden", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] px-5 py-3",
                  ALIGN_TH[col.align ?? "left"]
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={`skel-${i}`} className="border-b border-[#F3F4F6] last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5">
                    <Skeleton className="h-3 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-14 text-center text-[13px] text-[#9CA3AF]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                onClick={clickable ? () => onRowClick(row, i) : undefined}
                className={cn(
                  "border-b border-[#F3F4F6] last:border-0",
                  clickable && "hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "text-[13.5px] text-[#374151] px-5 py-3.5",
                      ALIGN_TD[col.align ?? "left"]
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
