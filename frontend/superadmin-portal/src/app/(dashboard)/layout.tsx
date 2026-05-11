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

  return (
    <SuperAdminShell
      nav={<SuperAdminNav />}
      navFooter={<SuperAdminNavFooter />}
      topRight={
        <span className="text-[13px] text-[#6B7280] truncate max-w-[200px]">
          {userEmail}
        </span>
      }
    >
      {children}
    </SuperAdminShell>
  );
}
