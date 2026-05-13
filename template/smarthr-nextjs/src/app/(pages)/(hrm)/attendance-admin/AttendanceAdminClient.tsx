"use client";

import dynamic from "next/dynamic";

const AttendanceAdminComponent = dynamic(
    () => import("@/components/hrm/attendance/attendanceadmin"),
    { ssr: false }
);

const AttendanceAdminClient = () => {
    return <AttendanceAdminComponent />;
};

export default AttendanceAdminClient;





