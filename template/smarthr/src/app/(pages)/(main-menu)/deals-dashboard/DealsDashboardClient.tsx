"use client";

import dynamic from "next/dynamic";

const DealsDashboardComponent = dynamic(
    () => import("@/components/mainMenu/dealsDashboard"),
    { ssr: false }
);

const DealsDashboardClient = () => {
    return <DealsDashboardComponent />;
};

export default DealsDashboardClient;





