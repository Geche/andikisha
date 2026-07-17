import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description: "AndikishaHR Data Processing Agreement — how we process personal data on behalf of your organisation.",
};

const SECTIONS = [
  { title: "1. Definitions", body: `"Controller" means the organisation (employer) that determines the purposes and means of processing employee personal data. "Processor" means AndikishaHR Limited, which processes personal data on behalf of the Controller. "Data Subject" means any identified or identifiable natural person whose personal data is processed — primarily employees of the Controller.` },
  { title: "2. Subject matter and duration", body: `AndikishaHR processes personal data on behalf of the Controller for the purpose of providing payroll, HR, and compliance services as described in the service agreement. Processing continues for the duration of the service agreement and ceases upon termination, subject to statutory retention requirements.` },
  { title: "3. Nature and purpose of processing", body: `Processing activities include: calculating statutory deductions (PAYE, NSSF, SHIF, Housing Levy), generating payslips, generating statutory return files for the Controller to file, maintaining employment records, and providing HR management tools. All processing is performed exclusively to deliver the contracted service.` },
  { title: "4. Type of personal data processed", body: `We process the following categories of data: employee names, national ID numbers, KRA PIN numbers, NSSF numbers, SHIF numbers, bank account details for salary disbursement, salary and compensation information, employment terms, leave records, and attendance data.` },
  { title: "5. Processor obligations", body: `AndikishaHR shall: process personal data only on documented instructions from the Controller; ensure that persons authorised to process personal data have committed to confidentiality; implement appropriate technical and organisational security measures; not engage sub-processors without prior written authorisation from the Controller; assist the Controller in meeting data subject rights requests.` },
  { title: "6. Controller obligations", body: `The Controller shall: ensure it has a lawful basis for processing employee personal data; provide accurate and complete data to AndikishaHR; notify AndikishaHR of any corrections required; handle data subject requests from employees and direct technical requests to AndikishaHR as appropriate.` },
  { title: "7. Security measures", body: `AndikishaHR maintains: AES-256 encryption at rest; TLS 1.3 in transit; tenant data isolated at the database schema level; role-based access controls; multi-factor authentication; penetration testing at least annually; incident response procedure with 72-hour breach notification to Controllers.` },
  { title: "8. Sub-processors", body: `AndikishaHR uses the following categories of sub-processors: cloud infrastructure providers (data hosted in East Africa) and email delivery services for system notifications. The Controller will be notified of any material changes to sub-processors with at least 30 days' notice.` },
  { title: "9. Data subject rights", body: `When AndikishaHR receives a request directly from a data subject (employee), it will promptly notify the Controller. The Controller remains responsible for responding to data subject rights requests. Erasure requests are subject to statutory retention requirements — KRA requires payroll records for 7 years.` },
  { title: "10. Data transfers", body: `All customer data is stored and processed within East Africa. AndikishaHR does not transfer personal data outside East Africa without the prior written consent of the Controller except where required by applicable law.` },
  { title: "11. Termination", body: `On termination of the service agreement, AndikishaHR will export all Controller data in a machine-readable format within 30 days and then securely delete all copies unless statutory retention obligations require otherwise. Deletion certificates are available on request.` },
  { title: "12. Governing law", body: `This Data Processing Agreement is governed by the laws of Kenya. Any disputes arising under this agreement shall be subject to the exclusive jurisdiction of the courts of Kenya.` },
];

export default function DpaPage() {
  return (
    <LegalPage
      title="Data Processing Agreement"
      subtitle="This agreement governs how AndikishaHR processes personal data on behalf of organisations using our platform, in compliance with the Kenya Data Protection Act 2019."
      lastUpdated="July 2026"
      sections={SECTIONS}
    />
  );
}
