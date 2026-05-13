"use client";

import dynamic from "next/dynamic";

const TicketsComponent = dynamic(
    () => import("@/components/hrm/tickets/tickets"),
    { ssr: false }
);

const TicketListClient = () => {
    return <TicketsComponent />;
};

export default TicketListClient;





