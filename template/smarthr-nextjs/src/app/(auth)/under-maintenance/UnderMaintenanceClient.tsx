"use client";

import dynamic from "next/dynamic";

const UnderMaintenanceComponent = dynamic(
    () => import("@/components/pages/underMaintenance"),
    { ssr: false }
);

const UnderMaintenanceClient = () => {
    return <UnderMaintenanceComponent />;
};

export default UnderMaintenanceClient;

