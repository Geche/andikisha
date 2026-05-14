import { headers } from "next/headers";
import { EmployeeClientShell } from "@/components/layout/EmployeeClientShell";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export default async function MyLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const userEmail = headersList.get("x-user-email") ?? "";

  return (
    <EmployeeClientShell userEmail={userEmail}>
      <ServiceWorkerRegistration />
      {children}
    </EmployeeClientShell>
  );
}
