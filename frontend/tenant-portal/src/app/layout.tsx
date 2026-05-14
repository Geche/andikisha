import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";
import { QueryProvider, ToastProvider, CurrentUserProvider } from "@andikisha/ui";
import type { CurrentUser } from "@andikisha/ui";
import type { UserRole } from "@andikisha/ui";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AndikishaHR", template: "%s | AndikishaHR" },
  description: "Enterprise HR and Payroll Management",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
  manifest: "/manifest.json",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();

  // Build initialUser from headers set by middleware.
  // Falls back gracefully when middleware has not run (e.g., static pages, login route).
  const userId = hdrs.get("x-user-id");
  const role = hdrs.get("x-user-role") ?? "";
  const roles = hdrs.get("x-user-roles")?.split(",").filter(Boolean) ?? (role ? [role] : []);

  const initialUser: CurrentUser | null = userId
    ? {
        userId,
        tenantId: hdrs.get("x-tenant-id") ?? "",
        email: hdrs.get("x-user-email") ?? "",
        roles: roles as UserRole[],
        employeeId: hdrs.get("x-employee-id") ?? undefined,
      }
    : null;

  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body className="font-body text-near-black bg-surface antialiased">
        {/*
          QueryProvider must wrap CurrentUserProvider because CurrentUserProvider
          uses useQuery internally. Inverting this order causes a "No QueryClient" error.
        */}
        <QueryProvider>
          <CurrentUserProvider initialUser={initialUser}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CurrentUserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
