"use client";

import dynamic from "next/dynamic";

const ClientListComponent = dynamic(
    () => import("@/components/projects/clinet/clientlist"),
    { ssr: false }
);

const ClientsClient = () => {
    return <ClientListComponent />;
};

export default ClientsClient;





