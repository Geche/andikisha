"use client";

import dynamic from "next/dynamic";

const TwoStepVerification3Component = dynamic(
    () => import("@/components/auth/twoStepVerification/twoStepVerification-3"),
    { ssr: false }
);

const TwoStepVerification3Client = () => {
    return <TwoStepVerification3Component />;
};

export default TwoStepVerification3Client;

