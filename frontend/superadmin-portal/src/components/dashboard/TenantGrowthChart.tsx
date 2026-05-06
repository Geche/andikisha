"use client";

import { useState } from "react";
import type { TenantGrowthPoint } from "@/types/dashboard";

const PERIODS = ["24h", "7d", "30d", "3m", "12m"] as const;
export type GrowthPeriod = (typeof PERIODS)[number];

const PERIOD_LABELS: Record<GrowthPeriod, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
  "3m": "3 months",
  "12m": "12 months",
};

interface Props {
  data: TenantGrowthPoint[];
  onPeriodChange?: (period: GrowthPeriod) => void;
}

export function TenantGrowthChart({ data, onPeriodChange }: Props) {
  const [period, setPeriod] = useState<GrowthPeriod>("12m");

  function selectPeriod(p: GrowthPeriod) {
    setPeriod(p);
    onPeriodChange?.(p);
  }

  const maxVal = data.reduce(
    (m, d) => Math.max(m, d.activeTenants, d.newSignups),
    1
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between px-6 pt-5 pb-0">
        <div>
          <p className="text-[15px] font-bold text-[#101828]">Tenant growth</p>
          <p className="text-[12.5px] text-gray-500 mt-0.5">New signups vs active tenants</p>
        </div>
        <button className="text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-3.5 py-1.5 hover:bg-gray-50 transition-colors">
          View report
        </button>
      </div>
      <div className="flex gap-0 px-6 pt-4 pb-0 border-b border-gray-100">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => selectPeriod(p)}
            className={[
              "text-[13px] font-medium px-4 py-1.5 border-b-2 transition-colors",
              period === p
                ? "text-[#0B3D2E] font-bold border-[#0B3D2E]"
                : "text-gray-500 border-transparent hover:text-gray-700",
            ].join(" ")}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
      <div className="px-6 py-5">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] border border-dashed border-gray-200 rounded-lg">
            <p className="text-[13px] text-gray-400">No growth data yet — provision your first tenant to start tracking.</p>
          </div>
        ) : null}
        <div className={`flex items-end gap-0 h-[180px] border-l border-b border-gray-100 ${data.length === 0 ? "hidden" : ""}`}>
          {data.map((point) => {
            const activeH = Math.round((point.activeTenants / maxVal) * 160);
            const newH = Math.round((point.newSignups / maxVal) * 160);
            return (
              <div key={point.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-end gap-1 flex-1">
                  <div
                    className="w-3.5 rounded-t-[3px] bg-[#D1F5E6] hover:opacity-75 transition-opacity"
                    style={{ height: `${activeH}px` }}
                    title={`Active: ${point.activeTenants}`}
                  />
                  <div
                    className="w-3.5 rounded-t-[3px] bg-[#0B3D2E] hover:opacity-75 transition-opacity"
                    style={{ height: `${newH}px` }}
                    title={`New: ${point.newSignups}`}
                  />
                </div>
                <p className="text-[11.5px] text-gray-400 font-medium">{point.month}</p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-5 mt-3 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#D1F5E6]" /> Active tenants
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0B3D2E]" /> New signups
          </span>
        </div>
      </div>
    </div>
  );
}
