"use client";

import dynamic from "next/dynamic";

const LeadsDashboardComponent = dynamic(
    () => import("@/components/mainMenu/leadsDashboard"),
    { ssr: false }
);

const LeadsDashboardClient = () => {
    return <LeadsDashboardComponent />;
};

export default LeadsDashboardClient;





