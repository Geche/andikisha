"use client";

import dynamic from "next/dynamic";

const CandidateKanbanComponent = dynamic(
    () => import("@/components/recruitment/candidates/candidatekanban"),
    { ssr: false }
);

const CandidatesKanbanClient = () => {
    return <CandidateKanbanComponent />;
};

export default CandidatesKanbanClient;





