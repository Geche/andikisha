"use client";

import dynamic from "next/dynamic";

const CompaniesComponent = dynamic(
    () => import("@/components/super-admin/companies"),
    { ssr: false }
);

const CompaniesClient = () => {
    return <CompaniesComponent />;
};

export default CompaniesClient;





