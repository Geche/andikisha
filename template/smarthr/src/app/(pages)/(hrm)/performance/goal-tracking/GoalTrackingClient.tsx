"use client";

import dynamic from "next/dynamic";

const GoalTrackingComponent = dynamic(
    () => import("@/components/performance/goalTracking"),
    { ssr: false }
);

const GoalTrackingClient = () => {
    return <GoalTrackingComponent />;
};

export default GoalTrackingClient;





