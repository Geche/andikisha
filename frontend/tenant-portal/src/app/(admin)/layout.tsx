import { TenantAdminShell } from "@andikisha/ui";
import { AdminNav, AdminNavFooter } from "@/components/layout/AdminNav";
import { TenantCommandPalette } from "@/components/layout/TenantCommandPalette";
import { AdminRoleGuard } from "@/components/layout/AdminRoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoleGuard>
      <TenantAdminShell nav={<AdminNav />} navFooter={<AdminNavFooter />}>
        <TenantCommandPalette />
        {children}
      </TenantAdminShell>
    </AdminRoleGuard>
  );
}
