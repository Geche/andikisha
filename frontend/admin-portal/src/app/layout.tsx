import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AndikishaHR - Admin Portal",
    description: "Enterprise HR and Payroll Management",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>{children}</body>
        </html>
    );
}