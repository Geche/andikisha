"use client";

import dynamic from "next/dynamic";

const DealsGridComponent = dynamic(
    () => import("@/components/crm/deals/dealsGrid"),
    { ssr: false }
);

const DealsGridClient = () => {
    return <DealsGridComponent />;
};

export default DealsGridClient;





