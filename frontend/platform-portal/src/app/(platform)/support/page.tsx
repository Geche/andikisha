import { PageHeader, EmptyState } from "@andikisha/ui";
import { LifeBuoy } from "lucide-react";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <>
      <PageHeader title="Support" subtitle="Tenant support tickets, agents, and SLA policies" />
      <div className="mt-6">
        <EmptyState
          icon={LifeBuoy}
          title="Coming soon"
          description="Support surfaces are under construction."
        />
      </div>
    </>
  );
}
