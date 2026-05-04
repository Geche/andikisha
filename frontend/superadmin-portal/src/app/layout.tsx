import type { Metadata } from "next";
import { Montserrat, DM_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AndikishaHR Super Admin",
    template: "%s | Super Admin",
  },
  description: "AndikishaHR platform administration portal",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${dmMono.variable}`}
    >
      <body className="font-body bg-surface text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
