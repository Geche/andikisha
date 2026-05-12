import {
  PageHeader,
  KpiGroup,
  StatCard,
  DataTable,
  Badge,
  Button,
} from "@andikisha/ui";

const ROWS = [
  { tenant: <span className="font-medium text-[#171717]">Rafiki Logistics Ltd</span>,   plan: "Growth",     status: <Badge status="active">Active</Badge>,    created: "3 Jan 2026" },
  { tenant: <span className="font-medium text-[#171717]">Savanna Tech Solutions</span>, plan: "Starter",    status: <Badge status="trial">Trial</Badge>,     created: "14 Feb 2026" },
  { tenant: <span className="font-medium text-[#171717]">Kilimanjaro Coffee Co.</span>, plan: "Enterprise", status: <Badge status="active">Active</Badge>,    created: "2 Nov 2025" },
  { tenant: <span className="font-medium text-[#171717]">BlueSky Financial Ltd</span>,  plan: "Growth",     status: <Badge status="suspended">Suspended</Badge>, created: "19 Mar 2026" },
  { tenant: <span className="font-medium text-[#171717]">Serengeti Media Group</span>,  plan: "Starter",    status: <Badge status="active">Active</Badge>,    created: "7 Apr 2026" },
];

export default function ShellPreviewPage() {
  const now = new Date();
  const subtitle =
    now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
    " · " +
    now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
    " EAT · Production";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <>
            <Button variant="outline">Export report</Button>
            <Button variant="cta">+ New Tenant</Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
        <KpiGroup cols={4}>
          <StatCard label="Active Tenants"     value="38"  change="↑ 4 this month" positive={true}  sub="42 total" />
          <StatCard label="MRR"                value="—"   sub="Billing not wired" />
          <StatCard label="Failed Filings 24h" value="—"   sub="Compliance not wired" />
          <StatCard label="Open Incidents"     value="0"   sub="All systems nominal" />
        </KpiGroup>

        {/* Tenant table */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#171717]">Recent Tenants</p>
            <button className="text-[12px] font-semibold text-[#0B3D2E] hover:underline">View all →</button>
          </div>
          <DataTable
            columns={[
              { key: "tenant",  label: "Tenant" },
              { key: "plan",    label: "Plan" },
              { key: "status",  label: "Status" },
              { key: "created", label: "Created" },
            ]}
            rows={ROWS}
            className="border-0 rounded-none"
          />
        </div>
      </div>
    </div>
  );
}
