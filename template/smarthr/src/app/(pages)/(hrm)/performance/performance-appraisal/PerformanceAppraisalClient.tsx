"use client";

import dynamic from "next/dynamic";

const PerformanceAppraisalComponent = dynamic(
    () => import("@/components/performance/performanceAppraisal"),
    { ssr: false }
);

const PerformanceAppraisalClient = () => {
    return <PerformanceAppraisalComponent />;
};

export default PerformanceAppraisalClient;





