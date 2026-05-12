"use client";

import dynamic from "next/dynamic";

const IncomingCallComponent = dynamic(
    () => import("@/components/application/call/incomingcall"),
    { ssr: false }
);

const IncomingCallClient = () => {
    return <IncomingCallComponent />;
};

export default IncomingCallClient;

