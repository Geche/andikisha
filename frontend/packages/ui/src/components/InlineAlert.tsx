import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "../utils";
import type { ReactNode, ElementType } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

const CONFIG: Record<AlertVariant, { icon: ElementType; classes: string }> = {
  info:    { icon: Info,          classes: "bg-blue-50 border-blue-200 text-blue-800" },
  success: { icon: CheckCircle,   classes: "bg-brand-50 border-brand-100 text-brand-800" },
  warning: { icon: AlertTriangle, classes: "bg-amber-light border-amber-light text-[#92600A]" },
  error:   { icon: XCircle,       classes: "bg-red-50 border-red-200 text-red-700" },
};

interface InlineAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  onRetry?: () => void;
}

export function InlineAlert({ variant = "info", title, children, className, onRetry }: InlineAlertProps) {
  const { icon: Icon, classes } = CONFIG[variant];
  return (
    <div className={cn("flex items-start gap-2.5 border rounded-xl px-4 py-3 text-[13px]", classes, className)}>
      <Icon size={15} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p>{children}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[12px] font-semibold underline underline-offset-2 hover:opacity-80 flex-shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}
