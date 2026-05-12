"use client";

import dynamic from "next/dynamic";

const MaintenancemodeComponent = dynamic(
    () => import("@/components/settings/systemSettings/maintenance-mode"),
    { ssr: false }
);

const MaintenanceModeClient = () => {
    return <MaintenancemodeComponent />;
};

export default MaintenanceModeClient;





