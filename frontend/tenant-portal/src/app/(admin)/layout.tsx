import { TenantAdminShell } from "@andikisha/ui";
import { AdminNav, AdminNavFooter } from "@/components/layout/AdminNav";
import { TenantCommandPalette } from "@/components/layout/TenantCommandPalette";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantAdminShell nav={<AdminNav />} navFooter={<AdminNavFooter />}>
      <TenantCommandPalette />
      {children}
    </TenantAdminShell>
  );
}
