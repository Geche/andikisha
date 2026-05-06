import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Profile" subtitle="Manage your super admin account details" />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-xl bg-white rounded-xl border border-gray-200 p-8">
          <p className="text-[13.5px] text-gray-500">
            Profile management — coming in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
