"use client";

import dynamic from "next/dynamic";

const AttendanceReportComponent = dynamic(
    () => import("@/components/administration/reports/attendencereport"),
    { ssr: false }
);

const AttendanceReportClient = () => {
    return <AttendanceReportComponent />;
};

export default AttendanceReportClient;





