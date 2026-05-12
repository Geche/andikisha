"use client";

import dynamic from "next/dynamic";

const TwoStepVerificationComponent = dynamic(
    () => import("@/components/auth/twoStepVerification/twoStepVerification"),
    { ssr: false }
);

const TwoStepVerificationClient = () => {
    return <TwoStepVerificationComponent />;
};

export default TwoStepVerificationClient;

