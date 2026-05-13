import { cn } from "../utils";
import { formatMoney } from "../lib/formatMoney";

interface MoneyAmountProps {
  amount: number | null | undefined;
  currency?: string;
  cents?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  dimZero?: boolean;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "text-[13px]",
  md: "text-[14px]",
  lg: "text-[18px] font-bold",
  xl: "text-[28px] font-bold leading-none",
};

export function MoneyAmount({
  amount,
  currency = "KES",
  cents = false,
  size = "md",
  className,
  dimZero = false,
}: MoneyAmountProps) {
  if (amount == null) {
    return (
      <span className={cn("tabular-nums text-[#9CA3AF]", SIZE_CLASSES[size], className)}>
        —
      </span>
    );
  }

  // Split the formatted string so the currency code can be styled separately
  const [code, ...rest] = formatMoney(amount, currency, cents).split(" ");
  const formatted = rest.join(" ");

  return (
    <span
      className={cn(
        "tabular-nums font-mono",
        SIZE_CLASSES[size],
        dimZero && amount === 0 ? "text-[#9CA3AF]" : "text-near-black",
        className
      )}
    >
      <span className="text-[0.75em] text-[#6B7280] mr-0.5 font-sans font-medium">{code}</span>
      {formatted}
    </span>
  );
}
