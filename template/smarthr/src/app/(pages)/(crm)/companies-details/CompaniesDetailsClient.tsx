"use client";

import dynamic from "next/dynamic";

const CompaniesDetailsComponent = dynamic(
    () => import("@/components/crm/companies/companiesDetails"),
    { ssr: false }
);

const CompaniesDetailsClient = () => {
    return <CompaniesDetailsComponent />;
};

export default CompaniesDetailsClient;

