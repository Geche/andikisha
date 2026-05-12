"use client";

import dynamic from "next/dynamic";

const CurrenciesComponent = dynamic(
    () => import("@/components/settings/financialSettings/currencies"),
    { ssr: false }
);

const CurrenciesClient = () => {
    return <CurrenciesComponent />;
};

export default CurrenciesClient;





