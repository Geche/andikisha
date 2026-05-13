"use client";

import dynamic from "next/dynamic";

const MediaComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/media"),
    { ssr: false }
);

const MediaClient = () => {
    return <MediaComponent />;
};

export default MediaClient;

