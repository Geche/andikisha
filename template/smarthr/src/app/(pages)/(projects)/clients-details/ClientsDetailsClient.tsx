"use client";

import dynamic from "next/dynamic";

const ClientDetailsCompnent = dynamic(
    () => import("@/components/projects/clinet/clientdetails"),
    { ssr: false }
);

const ClientsDetailsClient = () => {
    return <ClientDetailsCompnent />;
};

export default ClientsDetailsClient;





