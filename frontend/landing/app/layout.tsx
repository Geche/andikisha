import type { Metadata } from "next";
import { Montserrat, DM_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";

const manrope = Montserrat({
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://andikishahr.com"
  ),
  title: {
    default: "AndikishaHR — HR & Payroll for Kenyan Businesses",
    template: "%s | AndikishaHR",
  },
  description:
    "AndikishaHR automates PAYE, NSSF, SHIF, Housing Levy, and KRA filings for Kenyan SMEs. Run payroll in 30 minutes. Stay compliant. Every month.",
  keywords: [
    "HR software Kenya",
    "Payroll Kenya",
    "PAYE Kenya",
    "KRA compliance",
    "NSSF Kenya",
    "SHIF Kenya",
    "HR management Africa",
    "payroll automation",
    "Kenyan SME HR",
  ],
  authors: [{ name: "AndikishaHR" }],
  creator: "AndikishaHR",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://andikishahr.com",
    siteName: "AndikishaHR",
    title: "AndikishaHR — HR & Payroll for Kenyan Businesses",
    description:
      "Run payroll in 30 minutes. Full PAYE, NSSF, SHIF, and Housing Levy compliance built in. Trusted by 500+ Kenyan businesses.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AndikishaHR — HR & Payroll for Kenyan Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AndikishaHR — HR & Payroll for Kenyan Businesses",
    description:
      "Run payroll in 30 minutes. Full Kenya statutory compliance built in.",
    creator: "@andikishahr",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${dmMono.variable}`}
    >
      <body className="font-body text-neutral-900 bg-white">
        <ScrollProgress />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
