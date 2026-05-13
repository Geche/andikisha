"use client";

import dynamic from "next/dynamic";

const DailyReportComponent = dynamic(
    () => import("@/components/administration/reports/dailyreport"),
    { ssr: false }
);

const DailyReportClient = () => {
    return <DailyReportComponent />;
};

export default DailyReportClient;





