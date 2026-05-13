"use client";

import dynamic from "next/dynamic";

const BootstrapIconsComponent = dynamic(
    () => import("@/components/uiInterface/icons/bootstrapicons"),
    { ssr: false }
);

const BootstrapIconsClient = () => {
    return <BootstrapIconsComponent />;
};

export default BootstrapIconsClient;

