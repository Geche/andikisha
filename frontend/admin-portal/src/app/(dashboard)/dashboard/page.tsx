import { PageHeader } from "@andikisha/ui";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Dashboard" subtitle="Overview of your organisation" />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <p className="text-[13px] text-gray-400">Loading dashboard…</p>
      </div>
    </div>
  );
}
