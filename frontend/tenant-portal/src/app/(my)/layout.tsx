import { headers } from "next/headers";
import { EmployeeClientShell } from "@/components/layout/EmployeeClientShell";

export default async function MyLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const userEmail = headersList.get("x-user-email") ?? "";

  return (
    <EmployeeClientShell userEmail={userEmail}>
      {children}
    </EmployeeClientShell>
  );
}
