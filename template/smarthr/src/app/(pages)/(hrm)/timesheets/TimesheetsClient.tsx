"use client";

import dynamic from "next/dynamic";

const TimeSheetComponent = dynamic(
    () => import("@/components/hrm/attendance/timesheet"),
    { ssr: false }
);

const TimesheetsClient = () => {
    return <TimeSheetComponent />;
};

export default TimesheetsClient;





