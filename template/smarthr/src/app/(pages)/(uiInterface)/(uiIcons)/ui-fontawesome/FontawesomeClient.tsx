"use client";

import dynamic from "next/dynamic";

const FontawesomeIconsComponent = dynamic(
    () => import("@/components/uiInterface/icons/fontawesome"),
    { ssr: false }
);

const FontawesomeClient = () => {
    return <FontawesomeIconsComponent />;
};

export default FontawesomeClient;

