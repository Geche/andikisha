"use client";

import dynamic from "next/dynamic";

const TerminationComponent = dynamic(
    () => import("@/components/hrm/termination"),
    { ssr: false }
);

const TerminationClient = () => {
    return <TerminationComponent />;
};

export default TerminationClient;





