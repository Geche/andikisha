"use client";

import dynamic from "next/dynamic";

const VideocallssComponent = dynamic(
    () => import("@/components/application/call/videocalls"),
    { ssr: false }
);

const VideoCallClient = () => {
    return <VideocallssComponent />;
};

export default VideoCallClient;

