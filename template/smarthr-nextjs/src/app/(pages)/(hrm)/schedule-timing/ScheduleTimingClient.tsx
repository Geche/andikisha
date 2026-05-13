"use client";

import dynamic from "next/dynamic";

const ScheduleTimingComponent = dynamic(
    () => import("@/components/hrm/attendance/scheduletiming"),
    { ssr: false }
);

const ScheduleTimingClient = () => {
    return <ScheduleTimingComponent />;
};

export default ScheduleTimingClient;





