"use client";

import dynamic from "next/dynamic";

const LeadsDetailsComponent = dynamic(
    () => import("@/components/crm/leads/leadsDetails"),
    { ssr: false }
);

const LeadsDetailsClient = () => {
    return <LeadsDetailsComponent />;
};

export default LeadsDetailsClient;

