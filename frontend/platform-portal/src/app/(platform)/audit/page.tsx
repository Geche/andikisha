import { PageHeader, EmptyState } from "@andikisha/ui";
import { Shield } from "lucide-react";

export const metadata = { title: "Audit & Security" };

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit & Security" subtitle="Cross-tenant audit logs, security events, and KDPA requests" />
      <div className="mt-6">
        <EmptyState
          icon={Shield}
          title="Coming soon"
          description="Audit and security surfaces are under construction."
        />
      </div>
    </>
  );
}
