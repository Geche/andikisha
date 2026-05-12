"use client";

import dynamic from "next/dynamic";

const DealsDetailsComponent = dynamic(
    () => import("@/components/crm/deals/dealsDetails"),
    { ssr: false }
);

const DealsDetailsClient = () => {
    return <DealsDetailsComponent />;
};

export default DealsDetailsClient;





