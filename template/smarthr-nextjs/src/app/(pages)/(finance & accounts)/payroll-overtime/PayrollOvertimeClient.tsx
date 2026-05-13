"use client";

import dynamic from "next/dynamic";

const PayRollOvertimeComponent = dynamic(
    () => import("@/components/finance-accounts/payrool/payrollOvertime"),
    { ssr: false }
);

const PayrollOvertimeClient = () => {
    return <PayRollOvertimeComponent />;
};

export default PayrollOvertimeClient;





