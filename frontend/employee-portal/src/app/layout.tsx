import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AndikishaHR - Employee Portal",
    description: "Employee Self-Service Portal",
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
