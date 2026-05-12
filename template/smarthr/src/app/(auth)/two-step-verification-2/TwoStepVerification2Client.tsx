"use client";

import dynamic from "next/dynamic";

const TwoStepVerification2Component = dynamic(
    () => import("@/components/auth/twoStepVerification/twoStepVerification-2"),
    { ssr: false }
);

const TwoStepVerification2Client = () => {
    return <TwoStepVerification2Component />;
};

export default TwoStepVerification2Client;

