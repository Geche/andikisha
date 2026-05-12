"use client";

import dynamic from "next/dynamic";

const AnalyticsComponent = dynamic(
    () => import("@/components/crm/analytics/analytics"),
    { ssr: false }
);

const AnalyticsClient = () => {
    return <AnalyticsComponent />;
};

export default AnalyticsClient;





