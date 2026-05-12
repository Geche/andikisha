"use client";

import dynamic from "next/dynamic";

const VideoComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/video"),
    { ssr: false }
);

const VideoClient = () => {
    return <VideoComponent />;
};

export default VideoClient;

