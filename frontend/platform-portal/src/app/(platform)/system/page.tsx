import { PageHeader, EmptyState } from "@andikisha/ui";
import { Activity } from "lucide-react";

export const metadata = { title: "System Health" };

export default function SystemPage() {
  return (
    <>
      <PageHeader title="System Health" subtitle="Service status, queues, traces, and API gateway metrics" />
      <div className="mt-6">
        <EmptyState
          icon={Activity}
          title="Coming soon"
          description="System health surfaces are under construction."
        />
      </div>
    </>
  );
}
