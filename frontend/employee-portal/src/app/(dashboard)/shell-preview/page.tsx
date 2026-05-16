import {
  PageHeader,
  KpiGroup,
  StatCard,
  Badge,
  MoneyAmount,
} from "@andikisha/ui";

const PAYSLIPS = [
  { id: "1", period: "May 2026", net: 87500, status: "APPROVED" },
  { id: "2", period: "Apr 2026", net: 87500, status: "PAID" },
  { id: "3", period: "Mar 2026", net: 82000, status: "PAID" },
];

const LEAVES = [
  { id: "1", type: "Annual Leave",    dates: "2–6 Jun 2026",   days: 5, status: "APPROVED" },
  { id: "2", type: "Sick Leave",      dates: "14 Apr 2026",    days: 1, status: "APPROVED" },
  { id: "3", type: "Annual Leave",    dates: "24–28 Mar 2026", days: 5, status: "PENDING" },
];

function badgeStatus(s: string) {
  if (s === "APPROVED" || s === "PAID") return "approved" as const;
  if (s === "PENDING") return "pending" as const;
  return "draft" as const;
}

export default function ShellPreviewPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Good morning, Sarah"
        subtitle="HR Manager · Finance Department"
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
        <KpiGroup cols={4}>
          <StatCard label="Annual leave"    value="16d"  sub="Days remaining" />
          <StatCard label="Leave balance"   value="21d"  sub="All types combined" />
          <StatCard label="Latest net pay"  value={<MoneyAmount amount={87500} size="xl" />} sub="May 2026" />
          <StatCard label="Pending requests" value="1"   change="1 pending" positive={false} sub="Awaiting approval" />
        </KpiGroup>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Payslips */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#171717]">Recent Payslips</p>
              <button className="text-[12px] font-semibold text-[#0B3D2E] hover:underline">View all →</button>
            </div>
            <table className="w-full text-[13px]">
              <tbody>
                {PAYSLIPS.map((p) => (
                  <tr key={p.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-3.5 font-medium text-[#171717]">{p.period}</td>
                    <td className="px-6 py-3.5 text-right font-semibold tabular-nums font-mono text-[#171717]">
                      KES {p.net.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Badge status={badgeStatus(p.status)}>
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Leave requests */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#171717]">Leave Requests</p>
              <button className="text-[12px] font-semibold text-[#0B3D2E] hover:underline">Apply + view all →</button>
            </div>
            <table className="w-full text-[13px]">
              <tbody>
                {LEAVES.map((l) => (
                  <tr key={l.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-[#171717]">{l.type}</p>
                      <p className="text-[12px] text-[#A3A3A3] mt-0.5">{l.dates} · {l.days}d</p>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Badge status={badgeStatus(l.status)}>
                        {l.status.charAt(0) + l.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
