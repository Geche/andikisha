"use client";

import dynamic from "next/dynamic";

const PaySlipComponent = dynamic(
    () => import("@/components/finance-accounts/payrool/payslip"),
    { ssr: false }
);

const PayslipClient = () => {
    return <PaySlipComponent />;
};

export default PayslipClient;





