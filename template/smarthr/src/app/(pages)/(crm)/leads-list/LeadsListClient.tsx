"use client";

import dynamic from "next/dynamic";

const LeadsListComponent = dynamic(
    () => import("@/components/crm/leads/leadsList"),
    { ssr: false }
);

const LeadsListClient = () => {
    return <LeadsListComponent />;
};

export default LeadsListClient;





