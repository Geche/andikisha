"use client";

import dynamic from "next/dynamic";

const PrivacyPolicyComponent = dynamic(
    () => import("@/components/pages/privacy-policy"),
    { ssr: false }
);

const PrivacyPolicyClient = () => {
    return <PrivacyPolicyComponent />;
};

export default PrivacyPolicyClient;





