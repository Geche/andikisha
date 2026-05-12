"use client";

import dynamic from "next/dynamic";

const OutgoingCallComponent = dynamic(
    () => import("@/components/application/call/outgingcalls"),
    { ssr: false }
);

const OutgoingCallClient = () => {
    return <OutgoingCallComponent />;
};

export default OutgoingCallClient;

