"use client";

import dynamic from "next/dynamic";

const GoalTypeComponent = dynamic(
    () => import("@/components/performance/goalType"),
    { ssr: false }
);

const GoalTypeClient = () => {
    return <GoalTypeComponent />;
};

export default GoalTypeClient;





