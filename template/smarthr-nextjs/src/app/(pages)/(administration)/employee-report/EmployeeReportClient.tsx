"use client";

import dynamic from "next/dynamic";

const EmployeeReportsComponent = dynamic(
    () => import("@/components/administration/reports/employeereports"),
    { ssr: false }
);

const EmployeeReportClient = () => {
    return <EmployeeReportsComponent />;
};

export default EmployeeReportClient;





