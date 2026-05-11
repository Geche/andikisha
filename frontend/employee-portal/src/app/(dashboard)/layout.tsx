import { headers } from "next/headers";
import { ClientSidebar } from "@/components/layout/ClientSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userEmail = headersList.get("x-user-email") ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F7F4]">
      <ClientSidebar userEmail={userEmail} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
