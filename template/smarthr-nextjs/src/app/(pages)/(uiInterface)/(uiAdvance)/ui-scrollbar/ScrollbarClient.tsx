"use client";

import dynamic from "next/dynamic";

const ScrollbarComponent = dynamic(
    () => import("@/components/uiInterface/advanced-ui/uiscrollbar"),
    { ssr: false }
);

const ScrollbarClient = () => {
    return <ScrollbarComponent />;
};

export default ScrollbarClient;

