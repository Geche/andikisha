"use client";

import dynamic from "next/dynamic";

const TicketDetailsComponent = dynamic(
    () => import("@/components/hrm/tickets/ticket-details"),
    { ssr: false }
);

const TicketDetailsClient = () => {
    return <TicketDetailsComponent />;
};

export default TicketDetailsClient;





