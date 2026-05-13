"use client";

import dynamic from "next/dynamic";

const PerformanceReviewComponent = dynamic(
    () => import("@/components/performance/performanceReview"),
    { ssr: false }
);

const PerformanceReviewClient = () => {
    return <PerformanceReviewComponent />;
};

export default PerformanceReviewClient;





