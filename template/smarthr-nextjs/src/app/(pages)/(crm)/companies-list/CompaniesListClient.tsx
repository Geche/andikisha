"use client";

import dynamic from "next/dynamic";

const CompaniesListComponent = dynamic(
    () => import("@/components/crm/companies/companiesList"),
    { ssr: false }
);

const CompaniesListClient = () => {
    return <CompaniesListComponent />;
};

export default CompaniesListClient;





