import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";
import { QueryProvider, ToastProvider, CurrentUserProvider } from "@andikisha/ui";
import type { CurrentUser, UserRole } from "@andikisha/ui";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AndikishaHR Platform", template: "%s | AndikishaHR Platform" },
  description: "AndikishaHR Internal Platform Administration",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();

  const userId = hdrs.get("x-user-id");
  const role = hdrs.get("x-user-role") ?? "";
  const roles = hdrs.get("x-user-roles")?.split(",").filter(Boolean) ?? (role ? [role] : []);

  // SUPER_ADMIN has no tenant — tenantId is intentionally undefined here.
  const initialUser: CurrentUser | null = userId
    ? {
        userId,
        email: hdrs.get("x-user-email") ?? "",
        roles: roles as UserRole[],
      }
    : null;

  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body className="font-body antialiased bg-surface text-near-black">
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
