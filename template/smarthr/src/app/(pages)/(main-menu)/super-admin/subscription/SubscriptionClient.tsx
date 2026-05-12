"use client";

import dynamic from "next/dynamic";

const SubscriptionComponent = dynamic(
    () => import("@/components/super-admin/subscription"),
    { ssr: false }
);

const SubscriptionClient = () => {
    return <SubscriptionComponent />;
};

export default SubscriptionClient;





