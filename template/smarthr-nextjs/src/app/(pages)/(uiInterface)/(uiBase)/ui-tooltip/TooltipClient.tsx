"use client";

import dynamic from "next/dynamic";

const TooltipsComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/tooltips"),
    { ssr: false }
);

const TooltipClient = () => {
    return <TooltipsComponent />;
};

export default TooltipClient;

