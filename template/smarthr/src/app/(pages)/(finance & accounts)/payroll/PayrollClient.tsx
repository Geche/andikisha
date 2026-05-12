"use client";

import dynamic from "next/dynamic";

const PayRollComponent = dynamic(
    () => import("@/components/finance-accounts/payrool/payroll"),
    { ssr: false }
);

const PayrollClient = () => {
    return <PayRollComponent />;
};

export default PayrollClient;





