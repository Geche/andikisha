export const metadata = { title: "UI Preview | @andikisha/ui" };

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-alt p-8 font-body">
      {children}
    </div>
  );
}
