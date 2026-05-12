"use client";

import dynamic from "next/dynamic";

const PaymentReportComponent = dynamic(
    () => import("@/components/administration/reports/paymentreport"),
    { ssr: false }
);

const PaymentReportClient = () => {
    return <PaymentReportComponent />;
};

export default PaymentReportClient;





