"use client";

import dynamic from "next/dynamic";

const DealsListComponent = dynamic(
    () => import("@/components/crm/deals/dealsList"),
    { ssr: false }
);

const DealsListClient = () => {
    return <DealsListComponent />;
};

export default DealsListClient;





