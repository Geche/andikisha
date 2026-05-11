import { headers } from "next/headers";
import { TenantAdminShell } from "@andikisha/ui";
import { TenantAdminNav, TenantAdminNavFooter } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userEmail = headersList.get("x-user-email") ?? "";
  const tenantId  = process.env.TENANT_ID ?? "";

  return (
    <TenantAdminShell
      nav={<TenantAdminNav />}
      navFooter={<TenantAdminNavFooter />}
      tenantName={tenantId ? undefined : undefined}
      topRight={
        <span className="text-[13px] text-[#6B7280] truncate max-w-[220px]">
          {userEmail}
        </span>
      }
    >
      {children}
    </TenantAdminShell>
  );
}
