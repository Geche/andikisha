import { headers } from "next/headers";
import { SuperAdminShell } from "@andikisha/ui";
import { SuperAdminNav, SuperAdminNavFooter } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userEmail = headersList.get("x-user-email") ?? "";

  void userEmail; // available for future use in impersonation banner

  return (
    <SuperAdminShell
      nav={<SuperAdminNav />}
      navFooter={<SuperAdminNavFooter />}
    >
      {children}
    </SuperAdminShell>
  );
}
