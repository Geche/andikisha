"use client";

import dynamic from "next/dynamic";

const ClienttGridComponent = dynamic(
    () => import("@/components/projects/clinet/clienttgrid"),
    { ssr: false }
);

const ClientsGridClient = () => {
    return <ClienttGridComponent />;
};

export default ClientsGridClient;





