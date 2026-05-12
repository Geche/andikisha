"use client";

import dynamic from "next/dynamic";

const OverTimeComponent = dynamic(
    () => import("@/components/hrm/attendance/overtime"),
    { ssr: false }
);

const OvertimeClient = () => {
    return <OverTimeComponent />;
};

export default OvertimeClient;





