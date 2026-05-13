"use client";

import dynamic from "next/dynamic";

const FlagIconsComponent = dynamic(
    () => import("@/components/uiInterface/icons/flagicon"),
    { ssr: false }
);

const FlagIconsClient = () => {
    return <FlagIconsComponent />;
};

export default FlagIconsClient;

