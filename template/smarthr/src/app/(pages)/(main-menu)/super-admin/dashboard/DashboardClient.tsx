"use client";

import dynamic from "next/dynamic";

const SuperAdminDashboardComponent = dynamic(
    () => import("@/components/super-admin/dashboard"),
    { ssr: false }
);

const DashboardClient = () => {
    return <SuperAdminDashboardComponent />;
};

export default DashboardClient;





