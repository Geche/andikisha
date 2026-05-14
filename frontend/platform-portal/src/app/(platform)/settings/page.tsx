import { PageHeader, EmptyState } from "@andikisha/ui";
import { Settings } from "lucide-react";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Platform configuration, rate limits, and feature rollouts" />
      <div className="mt-6">
        <EmptyState
          icon={Settings}
          title="Coming soon"
          description="Settings surfaces are under construction."
        />
      </div>
    </>
  );
}
