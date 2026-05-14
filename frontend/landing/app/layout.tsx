import type { Metadata } from "next";
import { Roboto, DM_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
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
    default: "AndikishaHR — HR and payroll, calculated correctly",
    template: "%s | AndikishaHR",
  },
  description:
    "Statutory deductions to the cent. Payslips on the phones your team already uses. Salary disbursement on M-Pesa. Built for modern African businesses.",
  keywords: ["HR software Kenya", "Payroll Kenya", "PAYE", "KRA compliance", "NSSF", "SHIF", "M-Pesa payroll"],
  authors: [{ name: "AndikishaHR" }],
  creator: "AndikishaHR",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://andikishahr.com",
    siteName: "AndikishaHR",
    title: "AndikishaHR — HR and payroll, calculated correctly",
    description:
      "Statutory deductions to the cent. Payslips on the phones your team already uses. Salary disbursement on M-Pesa.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "AndikishaHR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AndikishaHR — HR and payroll, calculated correctly",
    description: "Statutory deductions to the cent. Built for modern African businesses.",
    creator: "@andikishahr",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AndikishaHR",
  url: "https://andikishahr.com",
  logo: "https://andikishahr.com/logomark.svg",
  description:
    "HR and payroll software built for modern African businesses. Statutory compliance, M-Pesa disbursement, and employee self-service.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Westlands Business Park",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@andikishahr.com",
  },
  sameAs: [
    "https://twitter.com/andikishahr",
    "https://linkedin.com/company/andikishahr",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${dmMono.variable}`}
    >
      <body className="font-body text-ink-900 bg-surface antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ScrollProgress />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
