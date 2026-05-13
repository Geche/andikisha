"use client";

import dynamic from "next/dynamic";

const TimeLinesComponent = dynamic(
    () => import("@/components/pages/timeline"),
    { ssr: false }
);

const TimelineClient = () => {
    return <TimeLinesComponent />;
};

export default TimelineClient;

