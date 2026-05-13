"use client";

import dynamic from "next/dynamic";

const RemixIconsComponent = dynamic(
    () => import("@/components/uiInterface/icons/remixIcons"),
    { ssr: false }
);

const RemixIconsClient = () => {
    return <RemixIconsComponent />;
};

export default RemixIconsClient;

