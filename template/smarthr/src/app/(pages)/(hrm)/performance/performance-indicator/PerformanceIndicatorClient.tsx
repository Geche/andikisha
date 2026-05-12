"use client";

import dynamic from "next/dynamic";

const PerformanceIndicatorComponent = dynamic(
    () => import("@/components/performance/performanceIndicator"),
    { ssr: false }
);

const PerformanceIndicatorClient = () => {
    return <PerformanceIndicatorComponent />;
};

export default PerformanceIndicatorClient;





