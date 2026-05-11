"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, User, Phone, Mail, Building2, Briefcase, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface EmployeeProfile {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  dateOfJoining: string;
  gender: string;
  nationalId: string;
  kraPin: string;
  nssfNumber: string;
  shifNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranch: string;
  status: string;
}

function Field({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
      {Icon && (
        <div className="w-7 h-7 rounded-md bg-[#E8F5F0] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={13} className="text-[#0B3D2E]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-[13.5px] font-medium text-[#02110C] truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-[14px] font-semibold text-[#02110C]">{title}</h2>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useQuery<EmployeeProfile>({
    queryKey: ["employee-profile-full"],
    queryFn: () => apiClient.get("/api/v1/employees/me").then((r) => r.data),
  });

  const initials = profile
    ? `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase()
    : "—";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-8 flex-shrink-0">
        <div className="flex items-center h-[73px]">
          <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">My Profile</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-5">
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load your profile.
          </div>
        )}

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#0B3D2E] text-white flex items-center justify-center text-[22px] font-bold flex-shrink-0">
            {isLoading ? "…" : initials}
          </div>
          <div>
            {isLoading ? (
              <>
                <div className="h-4 w-40 bg-gray-100 rounded-full animate-pulse mb-2"/>
                <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse"/>
              </>
            ) : (
              <>
                <p className="text-[18px] font-bold text-[#02110C]">
                  {profile?.firstName} {profile?.lastName}
                </p>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  {profile?.jobTitle} · {profile?.department}
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Employee #{profile?.employeeNumber}
                </p>
              </>
            )}
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              profile?.status === "ACTIVE"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-500 border-gray-200"
            }`}>
              {profile?.status ?? "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Section title="Contact">
            <Field icon={Mail} label="Work Email" value={profile?.email} />
            <Field icon={Phone} label="Phone" value={profile?.phone} />
          </Section>

          <Section title="Employment">
            <Field icon={Briefcase} label="Job Title" value={profile?.jobTitle} />
            <Field icon={Building2} label="Department" value={profile?.department} />
            <Field icon={Calendar} label="Date of Joining" value={profile?.dateOfJoining} />
          </Section>

          <Section title="Statutory Numbers">
            <Field icon={User} label="National ID" value={profile?.nationalId} />
            <Field label="KRA PIN" value={profile?.kraPin} />
            <Field label="NSSF Number" value={profile?.nssfNumber} />
            <Field label="SHIF Number" value={profile?.shifNumber} />
          </Section>

          <Section title="Bank Details">
            <Field label="Bank" value={profile?.bankName} />
            <Field label="Account Number" value={profile?.bankAccountNumber ? `••••${profile.bankAccountNumber.slice(-4)}` : "—"} />
            <Field label="Branch" value={profile?.bankBranch} />
          </Section>
        </div>
      </div>
    </div>
  );
}
