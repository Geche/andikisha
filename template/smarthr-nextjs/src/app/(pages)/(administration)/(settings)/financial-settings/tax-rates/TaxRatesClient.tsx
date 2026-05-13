"use client";

import dynamic from "next/dynamic";

const TaxRatesComponent = dynamic(
    () => import("@/components/settings/financialSettings/taxRates"),
    { ssr: false }
);

const TaxRatesClient = () => {
    return <TaxRatesComponent />;
};

export default TaxRatesClient;





