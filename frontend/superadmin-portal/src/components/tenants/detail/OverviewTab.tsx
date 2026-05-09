import type { TenantDetail } from "@/types/tenant";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
      <p className="w-44 flex-shrink-0 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="flex-1 text-[13.5px] text-[#02110C]">{value ?? <span className="text-gray-400">—</span>}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-[13px] font-bold text-[#02110C]">{title}</p>
      </div>
      <div className="px-6 py-1">{children}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE:    "bg-[#D1F5E6] text-[#0F5040]",
    TRIAL:     "bg-[#E8F5F0] text-[#166A50] border border-[#D1F5E6]",
    SUSPENDED: "bg-[#FEE2E2] text-[#991B1B]",
    CANCELLED: "bg-gray-100 text-gray-500",
    DELETED:   "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      <span className="w-[5px] h-[5px] rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

interface Props {
  tenant: TenantDetail;
}

export function OverviewTab({ tenant }: Props) {
  const since = new Date(tenant.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="grid grid-cols-2 gap-5">
      <Section title="Organisation">
        <Row label="Name"         value={tenant.organisationName} />
        <Row label="Status"       value={<StatusPill status={tenant.status} />} />
        <Row label="Member since" value={since} />
        {tenant.suspensionReason && (
          <Row label="Suspension reason" value={
            <span className="text-red-600">{tenant.suspensionReason}</span>
          } />
        )}
        {tenant.trialEndsAt && (
          <Row label="Trial ends" value={
            new Date(tenant.trialEndsAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })
          } />
        )}
      </Section>

      <Section title="Admin Contact">
        <Row label="Email" value={
          <a href={`mailto:${tenant.adminEmail}`} className="text-[#166A50] hover:underline">
            {tenant.adminEmail}
          </a>
        } />
        <Row label="Phone" value={tenant.adminPhone} />
      </Section>

      <Section title="Statutory Registrations">
        <Row label="KRA PIN"      value={tenant.kraPin} />
        <Row label="NSSF Number"  value={tenant.nssfNumber} />
        <Row label="SHIF Number"  value={tenant.shifNumber} />
      </Section>

      <Section title="Pay Schedule">
        <Row label="Frequency" value={
          tenant.payFrequency.charAt(0) + tenant.payFrequency.slice(1).toLowerCase()
        } />
        <Row label="Pay Day"   value={`Day ${tenant.payDay} of month`} />
      </Section>
    </div>
  );
}
