import { PageHeader, EmptyState } from "@andikisha/ui";
import { Megaphone } from "lucide-react";

export const metadata = { title: "Communications" };

export default function CommunicationsPage() {
  return (
    <>
      <PageHeader title="Communications" subtitle="Tenant announcements, maintenance notices, and templates" />
      <div className="mt-6">
        <EmptyState
          icon={Megaphone}
          title="Coming soon"
          description="Communications surfaces are under construction."
        />
      </div>
    </>
  );
}
