import { headers } from "next/headers";
import { IdleWarningBanner } from "@andikisha/ui";
import { EmployeeClientShell } from "@/components/layout/EmployeeClientShell";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ConnectionBanner } from "@/components/ConnectionBanner";

const DEV_TIMEOUT = process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS
  ? parseInt(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS, 10)
  : undefined;

export default async function MyLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const userEmail = headersList.get("x-user-email") ?? "";

  return (
    <EmployeeClientShell userEmail={userEmail}>
      <ServiceWorkerRegistration />
      <ConnectionBanner />
      {children}
      <IdleWarningBanner
        thresholdMs={30 * 60 * 1000}
        warningMs={2 * 60 * 1000}
        cookieName="tenant_token"
        returnToAllowedPrefixes={["/my/", "/admin/"]}
        devThresholdMs={DEV_TIMEOUT}
      />
    </EmployeeClientShell>
  );
}
