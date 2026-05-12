"use client";

import dynamic from "next/dynamic";

const PE7IconsComponent = dynamic(
    () => import("@/components/uiInterface/icons/pe7icons"),
    { ssr: false }
);

const Pe7IconsClient = () => {
    return <PE7IconsComponent />;
};

export default Pe7IconsClient;

