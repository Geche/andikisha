"use client";

import dynamic from "next/dynamic";

const MaterialIconsComponent = dynamic(
    () => import("@/components/uiInterface/icons/materialicon"),
    { ssr: false }
);

const MaterialIconsClient = () => {
    return <MaterialIconsComponent />;
};

export default MaterialIconsClient;

