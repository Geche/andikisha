"use client";

import dynamic from "next/dynamic";

const CandidatesListComponent = dynamic(
    () => import("@/components/recruitment/candidates/candidatelist"),
    { ssr: false }
);

const CandidatesClient = () => {
    return <CandidatesListComponent />;
};

export default CandidatesClient;





