import { TenantAdminShell, IdleWarningBanner } from "@andikisha/ui";
import { AdminNav, AdminNavFooter } from "@/components/layout/AdminNav";
import { TenantCommandPalette } from "@/components/layout/TenantCommandPalette";
import { AdminRoleGuard } from "@/components/layout/AdminRoleGuard";

const DEV_TIMEOUT = process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS
  ? parseInt(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS, 10)
  : undefined;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoleGuard>
      <TenantAdminShell nav={<AdminNav />} navFooter={<AdminNavFooter />}>
        <TenantCommandPalette />
        {children}
      </TenantAdminShell>
      <IdleWarningBanner
        thresholdMs={30 * 60 * 1000}
        warningMs={2 * 60 * 1000}
        cookieName="tenant_token"
        returnToAllowedPrefixes={["/my/", "/admin/"]}
        devThresholdMs={DEV_TIMEOUT}
      />
    </AdminRoleGuard>
  );
}
