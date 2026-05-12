"use client";

import dynamic from "next/dynamic";

const CronjobScheduleComponent = dynamic(
    () => import("@/components/settings/otherSettings/cronjobSchedule"),
    { ssr: false }
);

const CronjobScheduleClient = () => {
    return <CronjobScheduleComponent />;
};

export default CronjobScheduleClient;

