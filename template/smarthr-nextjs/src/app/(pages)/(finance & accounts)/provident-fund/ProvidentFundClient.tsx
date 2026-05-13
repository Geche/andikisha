"use client";

import dynamic from "next/dynamic";

const ProvidentFundComponent = dynamic(
    () => import("@/components/finance-accounts/sales/provident_fund"),
    { ssr: false }
);

const ProvidentFundClient = () => {
    return <ProvidentFundComponent />;
};

export default ProvidentFundClient;





