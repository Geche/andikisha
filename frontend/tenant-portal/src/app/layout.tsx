import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { QueryProvider, ToastProvider, CurrentUserProvider } from "@andikisha/ui";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body className="font-body text-near-black bg-surface antialiased">
        <CurrentUserProvider>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </CurrentUserProvider>
      </body>
    </html>
  );
}
