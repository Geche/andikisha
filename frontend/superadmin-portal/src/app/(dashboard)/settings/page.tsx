import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Account Settings" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Account Settings" subtitle="Platform configuration and preferences" />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-xl bg-white rounded-xl border border-gray-200 p-8">
          <p className="text-[13.5px] text-gray-500">
            Account settings — coming in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
