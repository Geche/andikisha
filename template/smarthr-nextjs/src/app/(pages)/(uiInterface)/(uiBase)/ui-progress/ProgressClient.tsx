"use client";

import dynamic from "next/dynamic";

const ProgressComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/progress"),
    { ssr: false }
);

const ProgressClient = () => {
    return <ProgressComponent />;
};

export default ProgressClient;

