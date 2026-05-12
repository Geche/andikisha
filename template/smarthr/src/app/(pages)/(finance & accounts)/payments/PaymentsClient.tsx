"use client";

import dynamic from "next/dynamic";

const PaymentsComponent = dynamic(
    () => import("@/components/finance-accounts/sales/payment"),
    { ssr: false }
);

const PaymentsClient = () => {
    return <PaymentsComponent />;
};

export default PaymentsClient;





