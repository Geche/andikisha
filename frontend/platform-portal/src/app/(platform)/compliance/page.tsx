import { PageHeader, EmptyState } from "@andikisha/ui";
import { BookOpen } from "lucide-react";

export const metadata = { title: "Compliance" };

export default function CompliancePage() {
  return (
    <>
      <PageHeader title="Compliance Library" subtitle="Statutory rate library and regulatory changelog" />
      <div className="mt-6">
        <EmptyState
          icon={BookOpen}
          title="Coming soon"
          description="Compliance library surfaces are under construction."
        />
      </div>
    </>
  );
}
