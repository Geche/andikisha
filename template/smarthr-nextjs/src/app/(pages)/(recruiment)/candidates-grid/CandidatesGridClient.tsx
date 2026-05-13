"use client";

import dynamic from "next/dynamic";

const CandidateGridComponent = dynamic(
    () => import("@/components/recruitment/candidates/candidategrid"),
    { ssr: false }
);

const CandidatesGridClient = () => {
    return <CandidateGridComponent />;
};

export default CandidatesGridClient;





