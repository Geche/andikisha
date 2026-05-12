"use client";

import dynamic from "next/dynamic";

const TaxesComponent = dynamic(
    () => import("@/components/finance-accounts/sales/taxes"),
    { ssr: false }
);

const TaxesClient = () => {
    return <TaxesComponent />;
};

export default TaxesClient;





