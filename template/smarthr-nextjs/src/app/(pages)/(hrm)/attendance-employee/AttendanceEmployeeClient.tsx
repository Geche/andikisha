"use client";

import dynamic from "next/dynamic";

const AttendanceEmployeeComponent = dynamic(
    () => import("@/components/hrm/attendance/attendance_employee"),
    { ssr: false }
);

const AttendanceEmployeeClient = () => {
    return <AttendanceEmployeeComponent />;
};

export default AttendanceEmployeeClient;





