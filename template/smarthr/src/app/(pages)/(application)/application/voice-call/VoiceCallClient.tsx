"use client";

import dynamic from "next/dynamic";

const VoiceCallComponent = dynamic(
    () => import("@/components/application/call/voiceCall"),
    { ssr: false }
);

const VoiceCallClient = () => {
    return <VoiceCallComponent />;
};

export default VoiceCallClient;

