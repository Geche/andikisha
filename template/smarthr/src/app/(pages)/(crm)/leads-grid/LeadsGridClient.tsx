"use client";

import dynamic from "next/dynamic";

const LeadsGridComponent = dynamic(
    () => import("@/components/crm/leads/leadsGrid"),
    { ssr: false }
);

const LeadsGridClient = () => {
    return <LeadsGridComponent />;
};

export default LeadsGridClient;





