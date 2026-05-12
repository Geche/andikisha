"use client";

import dynamic from "next/dynamic";

const PayRollDeductionComponent = dynamic(
    () => import("@/components/finance-accounts/payrool/payrollDedution"),
    { ssr: false }
);

const PayrollDeductionClient = () => {
    return <PayRollDeductionComponent />;
};

export default PayrollDeductionClient;





