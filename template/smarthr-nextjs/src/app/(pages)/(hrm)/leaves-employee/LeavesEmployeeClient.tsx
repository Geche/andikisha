"use client";

import dynamic from "next/dynamic";

const LeaveEmployeeComponent = dynamic(
    () => import("@/components/hrm/attendance/leaves/leaveEmployee"),
    { ssr: false }
);

const LeavesEmployeeClient = () => {
    return <LeaveEmployeeComponent />;
};

export default LeavesEmployeeClient;





