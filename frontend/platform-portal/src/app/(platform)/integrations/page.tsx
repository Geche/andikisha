import { PageHeader, EmptyState } from "@andikisha/ui";
import { Plug } from "lucide-react";

export const metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader title="Integration Hub" subtitle="Third-party integration health and webhook logs" />
      <div className="mt-6">
        <EmptyState
          icon={Plug}
          title="Coming soon"
          description="Integration hub surfaces are under construction."
        />
      </div>
    </>
  );
}
