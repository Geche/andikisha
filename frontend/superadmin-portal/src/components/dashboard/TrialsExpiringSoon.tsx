import type { TenantSummary } from "@/types/tenant";

function urgencyClass(daysLeft: number) {
  if (daysLeft <= 3) return "text-[#EF4444]";
  if (daysLeft <= 6) return "text-[#C98510]";
  return "text-[#27A870]";
}

function daysUntil(isoDate: string) {
  return Math.ceil(
    (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

interface Props {
  tenants: TenantSummary[];
}

export function TrialsExpiringSoon({ tenants }: Props) {
  if (tenants.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-gray-100">
        <p className="text-[13.5px] font-bold text-[#101828]">Trials Expiring Soon</p>
        <a href="/tenants?status=TRIAL" className="text-[12px] font-semibold text-[#166A50] flex items-center gap-0.5">
          Manage <span className="text-base leading-none">›</span>
        </a>
      </div>
      {tenants.map((t) => {
        const days = t.trialExpiresAt ? daysUntil(t.trialExpiresAt) : null;
        return (
          <div
            key={t.id}
            className="flex items-center justify-between px-[18px] py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-[13px] font-semibold text-[#101828]">{t.companyName}</p>
              <p className="text-[11px] text-gray-500">{t.plan} · {t.employeeCount ?? "—"} employees</p>
            </div>
            {days !== null && (
              <p className={`text-[11.5px] font-bold ${urgencyClass(days)}`}>
                {days}d left
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
