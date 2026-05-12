"use client";

import dynamic from "next/dynamic";

const CallHistoryComponent = dynamic(
    () => import("@/components/application/call/callHistory"),
    { ssr: false }
);

const CallHistoryClient = () => {
    return <CallHistoryComponent />;
};

export default CallHistoryClient;

