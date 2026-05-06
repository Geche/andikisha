import type { ElementType } from "react";

type DeltaVariant = "up" | "down" | "warn";

interface MetricCardProps {
  label: string;
  value: number | string;
  delta: string;
  deltaVariant: DeltaVariant;
  icon: ElementType;
  colorVariant: "brand" | "green" | "amber" | "red";
}

const variantStyles = {
  brand: { border: "from-[#0B3D2E] to-[#27A870]", icon: "bg-[#E8F5F0] text-[#166A50]" },
  green: { border: "from-[#27A870] to-[#D1F5E6]", icon: "bg-[#D1F5E6] text-[#27A870]" },
  amber: { border: "from-[#E8A020] to-[#FEF3DC]", icon: "bg-[#FEF3DC] text-[#C98510]" },
  red:   { border: "from-[#EF4444] to-[#FEE2E2]", icon: "bg-[#FEE2E2] text-[#EF4444]" },
};

const deltaStyles: Record<DeltaVariant, string> = {
  up:   "bg-[#D1F5E6] text-[#0F5040]",
  down: "bg-[#FEE2E2] text-[#991B1B]",
  warn: "bg-[#FEF3DC] text-[#C98510]",
};

const valueStyles = {
  brand: "text-[#101828]",
  green: "text-[#101828]",
  amber: "text-[#C98510]",
  red:   "text-[#EF4444]",
};

export function MetricCard({
  label, value, delta, deltaVariant, icon: Icon, colorVariant,
}: MetricCardProps) {
  const s = variantStyles[colorVariant];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-[18px] relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] rounded-t-xl bg-gradient-to-r ${s.border}`} />
      <div className="flex items-start justify-between mb-2.5">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em]">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.icon}`}>
          <Icon size={15} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-[28px] font-extrabold leading-none tracking-tight ${valueStyles[colorVariant]}`}>
          {value}
        </p>
        <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${deltaStyles[deltaVariant]}`}>
          {delta}
        </span>
      </div>
    </div>
  );
}
