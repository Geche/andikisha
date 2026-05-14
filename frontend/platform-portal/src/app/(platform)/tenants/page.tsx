import { PageHeader, EmptyState } from "@andikisha/ui";
import { Building2 } from "lucide-react";

export const metadata = { title: "Tenants" };

export default function TenantsPage() {
  return (
    <>
      <PageHeader title="Tenants" subtitle="Manage all tenants on the platform" />
      <div className="mt-6">
        <EmptyState
          icon={Building2}
          title="Coming soon"
          description="Tenant management surfaces are under construction."
        />
      </div>
    </>
  );
}
