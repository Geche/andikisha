
"use client";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
        <div className="main-wrapper">
            {children}
        </div>
    </div>
  );
}
