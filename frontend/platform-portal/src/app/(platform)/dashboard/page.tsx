import { PageHeader } from "@andikisha/ui";
import { LayoutDashboard } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Platform Dashboard" />
      <div className="px-8 py-8 max-w-2xl">
        <div className="bg-white border border-neutral-200 rounded-xl px-6 py-8 text-center">
          <LayoutDashboard className="mx-auto mb-3 text-neutral-400" size={32} strokeWidth={1.5} />
          <p className="text-[15px] font-semibold text-neutral-900 mb-2">
            Welcome to the AndikishaHR platform portal.
          </p>
          <p className="text-[14px] text-neutral-500">
            Tenant management, billing, and platform health surfaces will appear here as they ship.
          </p>
        </div>
      </div>
    </>
  );
}
