"use client";

import dynamic from "next/dynamic";

const RibbonComponent = dynamic(
    () => import("@/components/uiInterface/advanced-ui/ribbon"),
    { ssr: false }
);

const RibbonClient = () => {
    return <RibbonComponent />;
};

export default RibbonClient;

