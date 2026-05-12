"use client";

import dynamic from "next/dynamic";

const LeaveSettingsComponent = dynamic(
    () => import("@/components/hrm/attendance/leaves/leavesettings"),
    { ssr: false }
);

const LeaveSettingsClient = () => {
    return <LeaveSettingsComponent />;
};

export default LeaveSettingsClient;





