import { headers } from "next/headers";
import { ClientShell } from "@/components/layout/ClientSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userEmail = headersList.get("x-user-email") ?? "";

  return (
    <ClientShell userEmail={userEmail}>
      {children}
    </ClientShell>
  );
}
