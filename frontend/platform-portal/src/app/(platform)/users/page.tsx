import { PageHeader, EmptyState } from "@andikisha/ui";
import { Users } from "lucide-react";

export const metadata = { title: "Platform Users" };

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Platform Users" subtitle="Internal Andikisha staff accounts and access management" />
      <div className="mt-6">
        <EmptyState
          icon={Users}
          title="Coming soon"
          description="Platform user management is under construction."
        />
      </div>
    </>
  );
}
