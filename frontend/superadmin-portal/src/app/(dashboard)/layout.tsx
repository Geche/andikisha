import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <Sidebar activePath={pathname} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
