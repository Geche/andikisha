import { PageHeader } from "@/components/layout/PageHeader";

export default function LicencesPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Plans & Licences" subtitle="Manage subscription plans and tenant licences" />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <p className="text-[15px] font-semibold text-gray-400 mb-1">Coming soon</p>
          <p className="text-[13px] text-gray-300">Analytics dashboards will be available in a future release.</p>
        </div>
      </div>
    </div>
  );
}
