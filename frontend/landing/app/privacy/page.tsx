import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AndikishaHR privacy policy — how we collect, use, and protect your data.",
};

const SECTIONS = [
  { title: "1. Data we collect", body: `We collect information you provide directly: company details, employee names, national ID numbers, KRA PIN numbers, salary information, and contact details. We also collect usage data to improve the platform — page views, feature interactions, and error logs. We do not sell any of this data to third parties.` },
  { title: "2. How we use your data", body: `Employee data is used exclusively to calculate payroll, statutory deductions, and generate reports for your organisation. We do not use payroll or HR data for advertising, profiling, or any purpose beyond delivering the AndikishaHR service to your organisation.` },
  { title: "3. Data storage and residency", body: `All customer data is stored in East Africa on encrypted infrastructure. We use AES-256 encryption at rest and TLS 1.3 in transit. Tenant data is isolated at the schema level — no customer can access another customer's data. Backups are retained for 30 days and stored in the same geographic region.` },
  { title: "4. Third-party services", body: `AndikishaHR integrates with KRA iTax and the NSSF portal to file statutory returns on your behalf. These integrations use secure API calls with credentials you provide. We also use infrastructure providers (cloud hosting, email delivery) who are contractually bound to data processing standards consistent with this policy.` },
  { title: "5. Employee data rights", body: `Employees of organisations using AndikishaHR can request access to their personal data, request corrections, and request deletion (subject to statutory retention requirements — KRA requires payroll records to be retained for 7 years). Requests should be directed to your employer's HR team, who manage data access through the platform.` },
  { title: "6. Data retention", body: `Active account data is retained for the duration of your subscription. On account closure, we retain statutory payroll records for 7 years as required by Kenyan law. Non-statutory data is deleted within 90 days of account closure. You can request a full data export at any time.` },
  { title: "7. Security incidents", body: `In the event of a data breach that affects your organisation, we will notify you within 72 hours of discovery, consistent with GDPR obligations. We maintain an incident response plan reviewed annually.` },
  { title: "8. Contact", body: `For privacy-related questions, contact our Data Protection Officer at privacy@andikishahr.com.` },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="AndikishaHR Limited is committed to protecting the personal data of our customers, their employees, and anyone who interacts with our platform."
      lastUpdated="April 2026"
      sections={SECTIONS}
    />
  );
}
