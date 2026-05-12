"use client";

import dynamic from "next/dynamic";

const TermsConditionComponent = dynamic(
    () => import("@/components/pages/terms-condition"),
    { ssr: false }
);

const TermsConditionClient = () => {
    return <TermsConditionComponent />;
};

export default TermsConditionClient;





