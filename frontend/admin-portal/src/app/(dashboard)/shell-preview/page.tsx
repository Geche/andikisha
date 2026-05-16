import {
  PageHeader,
  KpiGroup,
  StatCard,
  DataTable,
  Badge,
  Button,
  MoneyAmount,
} from "@andikisha/ui";

const ROWS = [
  { period: "May 2026",   frequency: "Monthly", employees: "142", totalNet: <MoneyAmount amount={4280500} size="sm" />, status: <Badge status="approved">Approved</Badge>,  date: "1 May 2026" },
  { period: "Apr 2026",   frequency: "Monthly", employees: "139", totalNet: <MoneyAmount amount={4152300} size="sm" />, status: <Badge status="paid">Paid</Badge>,           date: "1 Apr 2026" },
  { period: "Mar 2026",   frequency: "Monthly", employees: "138", totalNet: <MoneyAmount amount={4098700} size="sm" />, status: <Badge status="paid">Paid</Badge>,           date: "1 Mar 2026" },
  { period: "Feb 2026",   frequency: "Monthly", employees: "135", totalNet: <MoneyAmount amount={3990100} size="sm" />, status: <Badge status="paid">Paid</Badge>,           date: "1 Feb 2026" },
];

export default function ShellPreviewPage() {
  const now = new Date();
  const subtitle =
    now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
    " · " +
    now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
    " EAT";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <>
            <Button variant="outline">Export report</Button>
            <Button variant="cta">+ Run Payroll</Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
        <KpiGroup cols={4}>
          <StatCard label="Total employees"    value="142"          sub="Active headcount" />
          <StatCard label="Pending leave"      value="7"            change="7" positive={false} sub="Awaiting approval" />
          <StatCard label="Latest net payroll" value={<MoneyAmount amount={4280500} size="xl" />} sub="142 employees · May 2026" />
          <StatCard label="Last run status"    value={<Badge status="approved">Approved</Badge>} sub="Monthly payroll" />
        </KpiGroup>

        {/* Payroll trend */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[#171717]">Payroll trend</h2>
            <button className="text-[12px] font-semibold text-[#525252] border border-[#E5E7EB] rounded-lg px-3 py-1.5 hover:bg-[#FAFAFA]">
              View all runs
            </button>
          </div>
          <div className="flex items-end gap-2 h-36">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].slice(0,5).map((m, i) => {
              const heights = [55, 62, 70, 78, 100];
              return (
                <div key={m} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: "112px" }}>
                    <div className="w-full rounded-t-md" style={{ height: `${heights[i]}%`, background: i === 4 ? "#0B3D2E" : "#D1F5E6" }} />
                  </div>
                  <span className="text-[10px] text-[#A3A3A3]">{m}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent runs table */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#171717]">Recent Payroll Runs</p>
            <button className="text-[12px] font-semibold text-[#0B3D2E] hover:underline">View all →</button>
          </div>
          <DataTable
            columns={[
              { key: "period",    label: "Period" },
              { key: "frequency", label: "Frequency" },
              { key: "employees", label: "Employees", align: "right" },
              { key: "totalNet",  label: "Total Net",  align: "right" },
              { key: "status",    label: "Status" },
              { key: "date",      label: "Date" },
            ]}
            rows={ROWS}
            className="border-0 rounded-none"
          />
        </div>
      </div>
    </div>
  );
}
