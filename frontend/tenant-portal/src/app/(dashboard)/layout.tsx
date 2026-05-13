import { headers } from "next/headers";
import { TenantAdminShell } from "@andikisha/ui";
import { TenantAdminNav, TenantAdminNavFooter } from "@/components/layout/Sidebar";
import { TenantCommandPalette } from "@/components/layout/TenantCommandPalette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  void headersList; // userEmail available if needed

  return (
    <TenantAdminShell
      nav={<TenantAdminNav />}
      navFooter={<TenantAdminNavFooter />}
    >
      <TenantCommandPalette />
      {children}
    </TenantAdminShell>
  );
}
