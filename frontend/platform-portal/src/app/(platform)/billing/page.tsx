import { PageHeader, EmptyState } from "@andikisha/ui";
import { CreditCard } from "lucide-react";

export const metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <>
      <PageHeader title="Billing & Revenue" subtitle="Invoices, subscriptions, and revenue reporting" />
      <div className="mt-6">
        <EmptyState
          icon={CreditCard}
          title="Coming soon"
          description="Billing and revenue surfaces are under construction."
        />
      </div>
    </>
  );
}
