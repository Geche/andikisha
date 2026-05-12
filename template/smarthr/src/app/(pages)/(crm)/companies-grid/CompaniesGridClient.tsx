"use client";

import dynamic from "next/dynamic";

const CompaniesGridComponent = dynamic(
    () => import("@/components/crm/companies/companiesGrid"),
    { ssr: false }
);

const CompaniesGridClient = () => {
    return <CompaniesGridComponent />;
};

export default CompaniesGridClient;





