import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AndikishaHR Super Admin",
  description: "AndikishaHR platform administration portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
