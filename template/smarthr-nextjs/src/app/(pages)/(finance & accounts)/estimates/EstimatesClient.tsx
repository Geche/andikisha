"use client";

import dynamic from "next/dynamic";

const EstimatesComponent = dynamic(
    () => import("@/components/finance-accounts/sales/estimates"),
    { ssr: false }
);

const EstimatesClient = () => {
    return <EstimatesComponent />;
};

export default EstimatesClient;





