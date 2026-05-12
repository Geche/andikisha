"use client";

import dynamic from "next/dynamic";

const InvoiceReportComponent = dynamic(
    () => import("@/components/administration/reports/invoicereport"),
    { ssr: false }
);

const InvoiceReportClient = () => {
    return <InvoiceReportComponent />;
};

export default InvoiceReportClient;





