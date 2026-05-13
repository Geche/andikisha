"use client";

import dynamic from "next/dynamic";

const LeaveReportComponent = dynamic(
    () => import("@/components/administration/reports/leavereport"),
    { ssr: false }
);

const LeaveReportClient = () => {
    return <LeaveReportComponent />;
};

export default LeaveReportClient;





