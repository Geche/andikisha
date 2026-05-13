"use client";

import dynamic from "next/dynamic";

const PayslipReportComponent = dynamic(
    () => import("@/components/administration/reports/payslipreport"),
    { ssr: false }
);

const PayslipReportClient = () => {
    return <PayslipReportComponent />;
};

export default PayslipReportClient;





