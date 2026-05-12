"use client";

import dynamic from "next/dynamic";

const CronjobscheduleComponent = dynamic(
    () => import("@/components/settings/otherSettings/cronjobSchedule"),
    { ssr: false }
);

const CronjobClient = () => {
    return <CronjobscheduleComponent />;
};

export default CronjobClient;





