"use client";

import dynamic from "next/dynamic";

const LeaveTypeComponent = dynamic(
    () => import("@/components/settings/appSettings/leave-type"),
    { ssr: false }
);

const LeaveTypeClient = () => {
    return <LeaveTypeComponent />;
};

export default LeaveTypeClient;





