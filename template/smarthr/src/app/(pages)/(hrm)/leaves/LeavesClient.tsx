"use client";

import dynamic from "next/dynamic";

const LeaveAdminComponent = dynamic(
    () => import("@/components/hrm/attendance/leaves/leaveAdmin"),
    { ssr: false }
);

const LeavesClient = () => {
    return <LeaveAdminComponent />;
};

export default LeavesClient;





